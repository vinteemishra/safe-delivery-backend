"use strict";
var router = require("koa-router");
import {
  findProfileByEmail,
  randomProfilePassword,
  createPasswordVerification,
} from "./profile.model";

var request = require("request");
import config from "../../config/index";

export const whatsApp = router();

whatsApp.get("/", async (ctx) => {
  ctx.body = { msg: "ROOT!" };
});

whatsApp.post("/sendNewPasswordToWhatsApp", async (ctx) => {
  let { resetPassword, email: whatsAppID } = ctx.request.body;
  let sendNewPasswordToWhatsApp;
  let passwordVerificationCreated;
  let allGoodPleaseProceed = false;
  // let _messageTemplateHeader = ctx.request.body.sendPasswordHeader;
  // let _messageTemplateBody = ctx.request.body.sendPasswordBody;
  // let _messageTemplateDisclaimer = ctx.request.body.sendMessageDisclaimer;

  ctx.status = 200;
  const { profile } = await findProfileByEmail(whatsAppID);

  //Check if the user is in the DB. If not then return early with a result what the App can handle
  if (profile && resetPassword != true) {
    console.log("send password failed: user alreasy exist");
    return (ctx.body = {
      result: "userExists",
    });
  }

  //Check if the user is in the DB. If not then return early with a result what the App can handle
  else if (!profile && resetPassword) {
    console.log("resetPassword failed: user does not exist");
    return (ctx.body = {
      result: "invalidUser",
    });
  }

  //Generate a new password
  let new_password = randomProfilePassword();
  allGoodPleaseProceed = new_password.length > 0 ? true : false;
  console.log("new_password:" + new_password);

  //If the user has selected to get the new passwork send to a WhatsApp number, then send the new password.
  if (allGoodPleaseProceed) {
    sendNewPasswordToWhatsApp = await sendWhatsAppMessageThroughTurn(
      new_password,
      whatsAppID
    );
    allGoodPleaseProceed =
      sendNewPasswordToWhatsApp && sendNewPasswordToWhatsApp.sent === true;
  }

  //If the new password has been sent, then save a hash'ed version to the DB, so we can varify that the user is the one that had rechived the password, when the user tries to log in
  if (allGoodPleaseProceed) {
    passwordVerificationCreated = await createPasswordVerification(
      whatsAppID,
      new_password
    );
    allGoodPleaseProceed = passwordVerificationCreated ? true : false;
  }

  //If the above steps has gone well, and the whatsApp message has been sent, then send a message to the app that it did go as planed
  if (allGoodPleaseProceed) {
    return (ctx.body = {
      result: "passwordSent",
    });
  }

  //If one of the above steps for some reason did not go well, then sent a message back to the App that it did not go well
  else if (allGoodPleaseProceed === false) {
    return (ctx.body = {
      result: "passowordSentFailed",
    });
  }
  ctx.body = {
    result: "invalidUser",
  };
});

function makeRequest(url, data, headers = undefined) {
  return new Promise(function (resolve, reject) {
    request(
      { url: url, method: "POST", json: data, headers },
      function (error, res, body) {
        if (!error && res.statusCode == 200) {
          resolve(body);
        } else {
          reject(error || res);
        }
      }
    );
  });
}

function uploadFile(url, data, headers = undefined) {
  return new Promise(function (resolve, reject) {
    request(
      { url, method: "POST", body: data, headers },
      function (error, res, body) {
        if (!error && res.statusCode == 200) {
          resolve(body);
        } else {
          reject(error || res);
        }
      }
    );
  });
}

const validateContact = (to) =>
  makeRequest(
    "https://whatsapp.turn.io/v1/contacts",
    {
      blocking: "no_wait",
      contacts: [to],
    },
    { Authorization: `Bearer ${config.turnToken}` }
  ).catch((error) => {
    console.error("Error while validating contact: ", error);
  });

const sendMessageTemplateMessageThroughTurn = (to, parameters) =>
  makeRequest(
    "https://whatsapp.turn.io/v1/messages",
    {
      to,
      type: "template",
      template: {
        namespace: "5c3a0a46_ceae_4135_966e_68a1d56269c3",
        name: "signup",
        language: {
          code: "en",
          policy: "deterministic",
        },
        components: [
          {
            type: "body",
            parameters,
          },
        ],
      },
    },
    {
      Authorization: `Bearer ${config.turnToken}`,
    }
  );

export async function sendWhatsAppMessageThroughTurn(message, to) {
  var numberOfRequests = 0;
  var whatsappId;
  while (numberOfRequests < 10) {
    const validateResult = await validateContact(to);
    if (
      validateResult &&
      validateResult.contacts &&
      validateResult.contacts.constructor.name == "Array" &&
      validateResult.contacts.length > 0 &&
      validateResult.contacts[0].wa_id
    ) {
      whatsappId = validateResult.contacts[0].wa_id;
      break;
    } else {
      numberOfRequests += 1;
    }
  }

  if (whatsappId) {
    const sendMessageResult = await sendMessageTemplateMessageThroughTurn(
      whatsappId,
      [
        {
          type: "text",
          text: message,
        },
      ]
    ).catch((error) => {
      console.log("Error: ", error);
    });
    return { sent: sendMessageResult !== undefined };
  } else {
    console.log(
      "Unable to send message to whatsapp because of invalid whatsapp id"
    );
  }
}

const sendCertificateMessageTemplateMessageThroughTurn = async (
  to,
  components
) => {
  var numberOfRequests = 0;
  var whatsappId = undefined;
  while (numberOfRequests <= 10) {
    console.log("Validating contact :", to);
    const validateResult = await validateContact(to);
    console.log("Validation result: ", validateResult);
    if (
      validateResult &&
      validateResult.contacts &&
      validateResult.contacts.constructor.name == "Array" &&
      validateResult.contacts.length > 0
    ) {
      whatsappId = validateResult.contacts[0].wa_id;
      break;
    } else {
      numberOfRequests += 1;
    }
  }

  if (whatsappId) {
    console.log("Making a request to TURN: ", whatsappId);
    return await makeRequest(
      "https://whatsapp.turn.io/v1/messages",
      {
        to: whatsappId,
        type: "template",
        template: {
          namespace: "5c3a0a46_ceae_4135_966e_68a1d56269c3",
          name: "sharecertificate1",
          language: {
            code: "en",
            policy: "deterministic",
          },
          components: [...components],
        },
      },
      {
        Authorization: `Bearer ${config.turnToken}`,
      }
    ).catch((error) => {
      console.log("error while making a request to TURN: ", error.body);
    });
  }
};

const uploadMediaToTurn = async (png) => {
  return await uploadFile("https://whatsapp.turn.io/v1/media", png, {
    "Content-Type": "image/jpeg",
    Authorization: `Bearer ${config.turnToken}`,
  }).catch((error) => {
    console.log("error while uploading media to turn: ", error);
  });
};

export const shareCertificateThroughTurnAPI = async (
  to,
  png,
  isModuleCertificate
) => {
  var uploadToTurnResult = await uploadMediaToTurn(png);

  console.log("Upload to turn result: ", uploadToTurnResult);

  var messageSent;

  if (uploadToTurnResult) {
    uploadToTurnResult = JSON.parse(uploadToTurnResult);
    if (
      uploadToTurnResult.media &&
      Array.isArray(uploadToTurnResult.media) &&
      uploadToTurnResult.media.length > 0 &&
      uploadToTurnResult.media[0].id
    ) {
      messageSent = await sendCertificateMessageTemplateMessageThroughTurn(to, [
        {
          type: "header",
          parameters: [
            {
              type: "image",
              image: {
                id: uploadToTurnResult.media[0].id,
              },
            },
          ],
        },
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: `${
                isModuleCertificate ? "Expert" : "Champion"
              } Certificate`,
            },
          ],
        },
      ]);
      console.log("Final message sent result from TURN: ", messageSent);
      return messageSent !== undefined;
    }
  } else {
    console.log("Skipping sending message due to turn template not uploaded");
  }
  return false;
};
