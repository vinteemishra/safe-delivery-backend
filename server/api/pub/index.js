/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable comma-dangle */
"use strict";

import router from "koa-router";
import { shareCertificateThroughTurnAPI, whatsApp } from "./whatsApp";
import { updateMappings } from "./updateMappings";
import { countryLookup } from "./countryLookup";
import config from "../../config";
import { verifyEvents, saveEvents } from "../../lib/datacollection";
import { httpRequest, isDifferent, httpRequestPost } from "../../lib/httpUtil";
import {
  createBlockBlobFromBuffer,
  getBlockBlobToBuffer,
} from "../../lib/blobstorage";
import { createUniqueKeyWithDate } from "../../lib/createUniqueKeyWithDate";

import * as ShareCertificates from "./shareCert.model";
import { insert, list } from "./feedback";

import {
  createProfileSalt,
  createProfileHash,
  findProfileByEmail,
  findProfileById,
  createProfile,
  authenticateProfile,
  checkProfileToken,
  upsertProfile,
  removeProfile,
  randomProfilePassword,
  updateAndMergeProfile,
  deleteVerifiedPassword,
  verifyPassword,
} from "./profile.model";
import { validateEmail } from "../../lib/helper";

const mailgunApiKey = "key-4790d57583a4287524a72cd4d8026977";
const mailgunDomain = "mg.maternity.dk";

const pub = router();

// Add WhatsApp endpoints
pub.use("/whatsapp", whatsApp.routes(), whatsApp.allowedMethods());

pub.get("/", (ctx) => (ctx.body = config.version));

pub.get(
  "/version",
  (ctx) => (ctx.body = { arch: process.arch, version: process.version })
);

pub.get("/ping", (ctx) => {
  ctx.status = 200;
  ctx.body = JSON.stringify(ctx.headers);
});

// Allow mappings update from API
pub.get("/updateMappings", updateMappings);

// Try and get country from appId
pub.post("/countryLookup", countryLookup);

pub.post("/events", async (ctx) => {
  const evts = ctx.request.body;

  if (!verifyEvents(evts)) ctx.status = 400;
  else {
    await saveEvents(evts);
    ctx.status = 200;
  }
});

pub.post("/signup", async (ctx) => {
  const { email, country, password, name } = ctx.request.body;
  const whatsAppID = email;
  const method = ctx.request.body.method || "Email";

  console.log("body:" + JSON.stringify(ctx.request.body));
  console.log("email:" + email);
  console.log("country:" + country);
  console.log("password:" + password);
  console.log("name:" + name);

  let whatsAppPasswordVerified;
  let whatsAppPasswordVerificationDeleted;
  let data;

  if (method === "WhatsApp") {
    console.log("Verify password becuase method is whatsapp");
    whatsAppPasswordVerified = await verifyPassword(whatsAppID, password);
  }

  if (method === "WhatsApp" && !whatsAppPasswordVerified) {
    return (ctx.body = {
      result: "passWordDoNotMatch",
    });
  }

  console.log("WhatsAppPasswordVerified:" + whatsAppPasswordVerified);

  ctx.status = 200;
  const { profile } = await findProfileByEmail(email);

  //If there is a user with the userID, when early return. The user cannot create a user what already are pressent in the DB!
  if (profile) {
    return (ctx.body = {
      result: "userExists",
    });
  } else {
    data = await createProfile(email, password, name, method, country);
  }

  if (data && method === "WhatsApp") {
    whatsAppPasswordVerificationDeleted = await deleteVerifiedPassword(
      whatsAppID
    );

    //For testing, so there is no need to resend a new password all the time!
    // whatsAppPasswordVerificationDeleted = true;
  }

  if (whatsAppPasswordVerificationDeleted && method === "WhatsApp") {
    ctx.body = {
      ...data,
      result: "userCreated",
    };
  } else {
    ctx.body = {
      ...data,
      result: "userCouldNotBeCreated",
    };
  }

  if (data && method === "Email") {
    ctx.body = {
      ...data,
      result: "userCreated",
    };
  }
});

pub.post("/signin", async (ctx) => {
  const { email, password } = ctx.request.body;

  console.log("email:" + email);
  console.log("password:" + password);

  ctx.status = 200;
  const { profile } = await findProfileByEmail(email);

  if (!profile) {
    ctx.body = {
      result: "invalidUserOrPassword",
    };
  } else {
    let auth = authenticateProfile(profile, password, 0);

    if (auth) {
      ctx.body = {
        ...profile,
        result: "userSignedin",
      };
    } else {
      ctx.body = {
        result: "invalidUserOrPassword",
      };
    }
  }
});

pub.post("/profiles", async (ctx) => {
  const profiles = ctx.request.body;

  console.log(
    "index -> /profiles Incoming profiles: " +
      Object.keys(profiles || {}).length
  );

  let updated_profiles = {};

  for (var i in profiles) {
    let updated = {
      ...profiles[i],
      id: profiles[i].profileId,
    };

    const { profile, foundInGlobal } = await findProfileById(
      profiles[i].profileId
    );

    //Ealy return if the only profiles[i].profileId on the profiles list is an simple user. //App will crash otherwise, becourse that user is not part of the DB
    if (!profile) {
      console.log("This wasn't supposed to happen. Log this happening");
      (ctx.status = 200), (ctx.body = updated_profiles);
      return;
    }

    const updatedAndMergedProfile = updateAndMergeProfile(profile, updated);

    console.log("updatedAndMergedProfile: ", updatedAndMergedProfile);

    // Check if we need to save an update to the database
    if (isDifferent(profile, updatedAndMergedProfile)) {
      const update = await upsertProfile(
        updatedAndMergedProfile,
        foundInGlobal
      );
      console.log("Saving update - got result:", update);
    } else {
      console.log("No need to save anything...");
    }
    updated_profiles[profile.id] = updatedAndMergedProfile;
  }

  ctx.status = 200;
  ctx.body = updated_profiles;
});

pub.post("/resetPassword", async (ctx) => {
  let email = ctx.request.body.email;
  let whatsAppID = ctx.request.body.email;
  let whatsApp = ctx.request.body.whatsApp || false;
  let password = ctx.request.body.password;

  let sendResetPasswordToMail;
  let whatsAppPasswordVerified;
  let whatsAppPasswordVerificationDeleted;
  let mailSent = false;

  console.log("email:" + email);

  let new_password;

  ctx.status = 200;
  const { profile, foundInGlobal } = await findProfileByEmail(email);
  if (!profile) {
    //Check if the user is in the DB. If not then return early with a result what the App can handle.
    return (ctx.body = {
      result: "invalidUser",
    });
  }

  //If the user has selected has got a new passwork send to a WhatsApp number, then verify the new password and update the user with the new one.
  if (whatsApp === true) {
    whatsAppPasswordVerified = await verifyPassword(whatsAppID, password);

    if (!whatsAppPasswordVerified) {
      return (ctx.body = {
        result: "passWordDoNotMatch",
      });
    }
  }
  //If WhatsApp is not selected, then it's email. Send a new password to the mail
  else {
    //Generate a new password
    new_password = randomProfilePassword();
    console.log("new_password:" + new_password);

    var mailgun = require("mailgun-js")({
      apiKey: mailgunApiKey,
      domain: mailgunDomain,
    });

    var data = {
      from: "Maternity Safe Delivery App <no-reply@mg.maternity.dk>",
      to: email,
      subject: "Safe Delivery Password Reset",
      text:
        "Your Safe Delivery App password was reset.\nYour new password is: " +
        new_password,
    };

    sendResetPasswordToMail = await mailgun.messages().send(data);
    mailSent =
      sendResetPasswordToMail.message === "Queued. Thank you." ? true : false;
  }

  //If either whatsApp mesage or mail has been sent, when update the profile with that new password
  if (whatsAppPasswordVerified || mailSent) {
    const _password = whatsApp ? password : new_password;
    const salt = createProfileSalt();
    console.log("salt:" + salt);
    const hash = createProfileHash(_password, salt);
    console.log("hash:" + hash);

    let p = profile;
    p.salt = salt;
    p.hash = hash;
    let updatedprofile = await upsertProfile(p, foundInGlobal);

    //If the profile is successfully updated and are an WhatsApp user, then sent a message back to the App that all is well
    if (updatedprofile && whatsApp === true) {
      whatsAppPasswordVerificationDeleted = await deleteVerifiedPassword(
        whatsAppID
      );

      if (whatsAppPasswordVerificationDeleted) {
        ctx.body = {
          result: "passwordReset",
        };
      } else {
        ctx.body = {
          result: "resetPassWordFailed",
        };
      }
    }
    //If the profile was not successfully updated, then sent a message back to the App that it did not go well
    else {
      ctx.body = {
        result: "resetPassWordFailed",
      };
    }

    //If the profile is successfully updated and are an Email user, then sent a message back to the App that all is well
    if (updatedprofile && whatsApp != true) {
      ctx.body = {
        result: "passwordReset",
      };
    }
  }
  //If the new password has not been sent, then sent a message back to the App that it did not go well
  else {
    ctx.body = {
      result: "resetPassWordFailed",
    };
  }
});

pub.post("/authenticate", async (ctx) => {
  const id = ctx.request.body.id;
  const password = ctx.request.body.password;

  console.log("id:" + id);
  console.log("password:" + password);

  ctx.status = 200;
  const { profile } = await findProfileById(id);
  if (!profile) {
    ctx.body = {
      result: "invalidUser",
    };
  } else {
    let auth = authenticateProfile(
      profile,
      password,
      Date.now() + 1 * 60 * 1000
    );
    if (auth) {
      ctx.body = {
        ...profile,
        token: auth,
        result: "userAuthenticated",
      };
    } else {
      ctx.body = {
        result: "invalidPassword",
      };
    }
  }
});

pub.post("/updateProfileInfoV2", async (ctx) => {
  const { id, password, info } = ctx.request.body;

  // Check if all relevant info is present
  if (!id || !password || !info || !("name" in info && "email" in info)) {
    ctx.body = {
      result: "missingInfo",
    };
    return;
  }

  const { profile, foundInGlobal } = await findProfileById(id);

  if (!profile) {
    ctx.body = {
      result: "invalidUserOrPassword",
    };
    return;
  }

  const authenticated = await authenticateProfile(
    profile,
    password,
    Date.now() + 60 * 1000
  );
  if (!authenticated) {
    ctx.body = {
      result: "invalidUserOrPassword",
    };
    return;
  }

  // Check that we're not using an already existing email from _another_ user
  const { profile: profileByMail } = await findProfileByEmail(info.email);
  if (profileByMail && profileByMail.id !== profile.id) {
    ctx.body = {
      result: "mailAlreadyInUse",
    };
    return;
  }

  // At this point everything is verified and ready
  profile.profileName = info.name;
  profile.profileEmail = info.newEmail || info.email;
  profile.method = info.method || "Email";

  await upsertProfile(profile, foundInGlobal);

  ctx.body = {
    ...profile,
    result: "userUpdated",
  };
});

pub.post("/changePassword", async (ctx) => {
  const id = ctx.request.body.id;
  const newPassword = ctx.request.body.newPassword;
  const oldPassword = ctx.request.body.oldPassword;

  if (!id || !newPassword || !oldPassword) {
    ctx.body = {
      result: "missingInfo",
    };
    return;
  }

  const { profile, foundInGlobal } = await findProfileById(id);
  if (!profile) {
    ctx.body = {
      result: "invalidUserOrPassword",
    };
    return;
  }

  const authenticated = await authenticateProfile(
    profile,
    oldPassword,
    Date.now() + 60 * 1000
  );
  if (!authenticated) {
    ctx.body = {
      result: "invalidUserOrPassword",
    };
    return;
  }

  // At this point everything is verified and ready
  const salt = createProfileSalt();
  console.log("new salt:" + salt);
  const hash = createProfileHash(newPassword, salt);
  console.log("new hash:" + hash);

  profile.salt = salt;
  profile.hash = hash;
  await upsertProfile(profile, foundInGlobal);
  console.log("upserted profile", profile);

  ctx.body = {
    ...profile,
    result: "userUpdated",
  };
});

pub.post("/deleteUser", async (ctx) => {
  const id = ctx.request.body.id;
  const password = ctx.request.body.password;

  if (!id || !password) {
    ctx.body = {
      result: "missingInfo",
    };
    return;
  }

  const { profile, foundInGlobal } = await findProfileById(id);
  if (!profile) {
    ctx.body = {
      result: "invalidUserOrPassword",
    };
    return;
  }

  const authenticated = await authenticateProfile(
    profile,
    password,
    Date.now() + 60 * 1000
  );
  if (!authenticated) {
    ctx.body = {
      result: "invalidUserOrPassword",
    };
    return;
  }

  await removeProfile(profile, foundInGlobal);
  console.log("profile deleted", profile);

  ctx.body = {
    result: "userDeleted",
  };
});

pub.post("/updateProfileInfo", async (ctx) => {
  const { id, token, info } = ctx.request.body;

  console.log("id:" + id);
  console.log("token:" + token);

  ctx.status = 200;
  const { profile, foundInGlobal } = await findProfileById(id);
  if (!profile) {
    ctx.body = {
      result: "invalidUser",
    };
  } else {
    if (checkProfileToken(profile, token)) {
      let { expiry } = JSON.parse(token);

      if (Date.now() > expiry) {
        ctx.body = {
          result: "tokenExpired",
        };
        return;
      }

      //let auth = authenticateProfile(profile, password);
      //if(auth) {
      if (info.name) {
        profile.profileName = info.name;
      }
      if (info.email) {
        profile.profileEmail = info.email;
      }
      if (info.password) {
        const salt = createProfileSalt();
        console.log("salt:" + salt);
        const hash = createProfileHash(info.password, salt);
        console.log("hash:" + hash);

        profile.salt = salt;
        profile.hash = hash;
      }

      await upsertProfile(profile, foundInGlobal);
      console.log("upserted profile", profile);

      ctx.body = {
        result: "userUpdated",
      };
    } else {
      ctx.body = {
        result: "invalidToken",
      };
    }
  }
});

async function sendEmail(
  email,
  png,
  member,
  certId,
  thirdParty = false,
  isModuleCertificate = false
) {
  const mailgun = require("mailgun-js")({
    apiKey: mailgunApiKey,
    domain: mailgunDomain,
  });
  const cert = new mailgun.Attachment({
    data: png,
    filename: "certificate.png",
    contentType: "image/png",
  });

  let text = `Your Safe Delivery ${
    isModuleCertificate === true ? "Expert" : "Champion"
  } Certificate is attached.`;
  if (thirdParty) {
    text =
      "A Safe Delivery Champion Certificate has been given and shared with you. See attachment.";
  }

  if (member) {
    text += `\n\nMember ID: ${member}`;
  }
  if (certId) {
    text += `\nCertificate ID: ${certId}`;
  }

  const data = {
    from: "Maternity Certificate <no-reply@mg.maternity.dk>",
    to: email,
    subject: `Safe Delivery ${
      isModuleCertificate === true ? "Expert" : "Champion"
    } Certificate`,
    text,
    attachment: cert,
  };

  const result = await mailgun.messages().send(data);

  // If the messege has been sent to the email, then set a flag to use later
  return result.message === "Queued. Thank you.";
}

async function sendErrorEmail(error) {
  const mailgun = require("mailgun-js")({
    apiKey: mailgunApiKey,
    domain: mailgunDomain,
  });

  const data = {
    from: "Maternity CMS <no-reply@mg.maternity.dk>",
    to: "morten@maternity.dk",
    subject: "Error from CMS",
    text: error,
  };

  const result = await mailgun.messages().send(data);

  // If the messege has been sent to the email, then set a flag to use later
  return result.message === "Queued. Thank you.";
}

async function sendToWhatsApp(whatsAppID, png, isModuleCertificate = false) {
  const generateUniqueNumberForCert = createUniqueKeyWithDate();

  const certFileName = "cert/" + generateUniqueNumberForCert + ".jpg"; //Generate the unique filename for the certificate - For TURN API used for WhatsApp
  // const azureHttps =
  //   config.env === "dev"
  //     ? "https://sdacms.blob.core.windows.net/localcontent/"
  //     : "https://sdacms.blob.core.windows.net/content/";
  //
  // const certLink = azureHttps + certFileName;

  //Upload the certificate stored in png to the Azure blob storage
  const fileBlob = await createBlockBlobFromBuffer(false)(
    certFileName,
    png,
    "image/jpg"
  );

  //If the upload goes well, then send the whole link for the uploaded cert, to the provided WhatsApp ID
  if (fileBlob.name === certFileName) {
    return await shareCertificateThroughTurnAPI(
      whatsAppID,
      png,
      isModuleCertificate
    );
  }
  return false;
}

async function shareWithThirdParties(country, member, certId, png) {
  if (typeof country !== "string" || country.trim().length !== 2) {
    return;
  }

  try {
    const blobBuffer = await getBlockBlobToBuffer(
      "certificateThirdParties.json"
    );
    const thirdParties = JSON.parse(blobBuffer.toString());

    const orgs = thirdParties.organizations.filter(
      (org) => org.country === country
    );
    for (const org of orgs) {
      await sendEmail(org.email, png, member, certId, true);
      console.log("Shared with this org:", org);
    }
  } catch (e) {
    // Send error mail.
    const errorMessage = `Got error while sharing certificate with third party. \n\n Error: ${e.toString()}`;
    await sendErrorEmail(errorMessage);
  }

  return;
}

pub.post("/genCertificate", async (ctx) => {
  let { member, uniqueId, name, jobTitle, certDate, language, country } =
    ctx.request.body;

  let _member = "";
  let _language = language || undefined;
  let _uniqueId;
  member && member.trim() !== "" && (_member = member);

  uniqueId && uniqueId.trim() !== "" && (_uniqueId = uniqueId);

  const certHeader = "This certificate is granted to";
  const certBody = "For successfully completing the MyLearning";
  const certBody1 = "certification exam in the Safe Delivery App";
  const certBody2 = "and earning the title of:";

  //Provide the options for the Post request that generets the certificate
  let options = {
    host: "sdacms-duration.westeurope.cloudapp.azure.com",
    path: "/cert",
    port: config.certificationService.port,
    headers: { "x-sda-auth": config.durationService.apiKey },
  };

  //Build the body for the generation of the certificate
  let body = {
    name,
    jobTitle,
    certDates: [certDate],
    certHeader,
    certBody,
    certBody1,
    certBody2,
    language: _language,
    uniqueId: _uniqueId,
    country,
  };

  //Draw the certificate image from the above options and body
  let png = await httpRequestPost(options, body);
  ctx.type = "png";
  ctx.body = png;
});

pub.post("/shareCertificate", async (ctx) => {
  let {
    email,
    member,
    uniqueId,
    name,
    jobTitle,
    workPlace,
    certHeader,
    certBody,
    certBody1,
    certBody2,
    certDate,
    certDates,
    method,
    language,
    country,
    moduleName,
  } = ctx.request.body;

  let _certDates = certDates || [];
  let _certHeader;
  let _certBody;
  let _certBody1;
  let _certBody2;
  let _member = "";
  let _uniqueId = "N/A";
  let whatsAppID = email;
  let _method = method || "Email";
  let _language = language || undefined;

  if (member && member.trim() !== "") {
    _member = member;
  }

  if (uniqueId && uniqueId.trim() !== "") {
    _uniqueId = uniqueId;
  }

  const oldApp = workPlace !== undefined; //Determine if the data comes from an old version of the app!

  //Determine if there is the the required data comming from the old or the new app
  const noDataFromOldApp =
    oldApp && (!workPlace || !email || !name || !jobTitle);

  const noDataFromNewApp =
    !oldApp &&
    (!email ||
      !name ||
      !jobTitle ||
      !certHeader ||
      !certBody ||
      !certBody1 ||
      !certBody2 ||
      _certDates.length === 0);

  //Determine if there is data comming from the old or the new app. If not then early return with a 'invalidUserDat' status!
  if (noDataFromOldApp || noDataFromNewApp) {
    ctx.status = 400;
    ctx.body = {
      result: "invalidUser",
    };
    return;
  }

  //If the data comes from the old app, then set the date and text for the cert
  if (oldApp) {
    _certDates.push(certDate);
    _certHeader = "This certificate is granted to";
    _certBody = "For successfully completing the MyLearning";
    _certBody1 = "certification exam in the Safe Delivery App";
    _certBody2 = "and earning the title of:";
  } else {
    //If the data somes from the new app, then fill the local variables with the data comming from the app
    _certHeader = certHeader;
    _certBody = certBody;
    _certBody1 = certBody1;
    _certBody2 = certBody2;
  }

  const isModuleCertificate =
    certBody1 && certBody1.includes("module") ? true : false;

  // At this point we save a database entry. User got through the email verification in the app
  const dbEntryData = {
    email,
    memberId: _member,
    uniqueId: _uniqueId.replace(/-/g, "").toLowerCase(),
    name,
    jobTitle,
    workPlace,
    certDates,
    method: _method,
    language: _language,
    country,
    moduleName,
    isModuleCertificate,
  };
  await ShareCertificates.upsert(dbEntryData);

  //Provide the options for the Post request that generets the certificate
  let options = {
    host: process.env.CERT_HOST || config.certificationService.host,
    path: "/cert",
    port: config.certificationService.port,
    headers: { "x-sda-auth": config.durationService.apiKey },
  };

  //Build the body for the generation of the certificate
  let body = {
    name,
    jobTitle,
    certDates: _certDates,
    certHeader: _certHeader,
    certBody: _certBody,
    certBody1: _certBody1,
    certBody2: _certBody2,
    language: _language,
    uniqueId,
    memberId: _member,
    country,
  };

  //Draw the certificate image from the above options and body
  let png = await httpRequestPost(options, body);

  // Potentially share with third parties
  await shareWithThirdParties(country, _member, uniqueId, png);

  // Finally send
  let sendSuccess = false;
  if (_method === "WhatsApp") {
    sendSuccess = await sendToWhatsApp(whatsAppID, png, isModuleCertificate);
  } else if (_method === "Email") {
    //Verify the email
    if (!email || !validateEmail(email)) {
      ctx.status = 400;
      ctx.body = {
        result: "invalidEmail",
      };
      return;
    }

    sendSuccess = await sendEmail(
      email,
      png,
      _member,
      uniqueId,
      false,
      isModuleCertificate
    );
  }

  //If the certficate has been sent to WhatsApp or Email, then report back to the app with the result, if not when report this
  if (sendSuccess) {
    ctx.body = {
      result: "certificateShared",
    };
  } else {
    ctx.body = {
      result: "certificateCouldNotBeSent",
    };
  }
});

pub.get("/testCert", async (ctx) => {
  let info = {
    name: "Jeppe Stampe",
    workPlace: "Visikon",
    jobTitle: "Dev",
    certDate: new Date().getTime(),
  };

  const path =
    "/cert?name=" +
    encodeURIComponent(info.name) +
    "&workPlace=" +
    encodeURIComponent(info.workPlace) +
    "&jobTitle=" +
    encodeURIComponent(info.jobTitle) +
    "&certDate=" +
    encodeURIComponent(info.certDate);
  var options = {
    host: config.certificationService.host,
    path: path,
    port: config.certificationService.port,
    headers: { "x-sda-auth": config.durationService.apiKey },
  };
  var png = await httpRequest(options);

  ctx.status = 200;
  ctx.contentType = "image/png";
  ctx.body = png;
});

pub.get("/testShare", async (ctx) => {
  var mailgun = require("mailgun-js")({
    apiKey: "key-4790d57583a4287524a72cd4d8026977",
    domain: "mg.maternity.dk",
  });

  let info = {
    name: "Jeppe Stampe",
    workPlace: "Visikon",
    jobTitle: "Dev",
    certDate: new Date().getTime(),
  };

  const path =
    "/cert?name=" +
    encodeURIComponent(info.name) +
    "&workPlace=" +
    encodeURIComponent(info.workPlace) +
    "&jobTitle=" +
    encodeURIComponent(info.jobTitle) +
    "&certDate=" +
    encodeURIComponent(info.certDate);
  var options = {
    host: config.certificationService.host,
    path: path,
    port: config.certificationService.port,
    headers: { "x-sda-auth": config.durationService.apiKey },
  };
  var png = await httpRequest(options);
  var cert = new mailgun.Attachment({
    data: png,
    filename: "certificate.png",
    contentType: "image/png",
  });

  var data = {
    from: "Maternity Certificate <no-reply@mg.maternity.dk>",
    to: "jst@visikon.com",
    subject: "Safe Delivery Champion Certificate",
    text: "Your Safe Delivery Champion Certificate is attached.",
    attachment: cert,
  };

  let result = await mailgun.messages().send(data);

  ctx.status = 200;
  ctx.body = JSON.stringify(result);
});

pub.post("/feedback", async (ctx) => {
  let data = await insert(ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
});

pub.get("/feedback", async (ctx) => {
  let data = await list();
  ctx.status = 200;
  ctx.body = data;
});

export default pub;
