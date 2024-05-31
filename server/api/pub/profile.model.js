"use strict";

import crypto from "crypto";
import { profileDbClient } from "../../lib/profiledb";
import { profileDbIndiaClient } from "../../lib/profiledbIndia";

function randomString(length, chars) {
  if (!chars) {
    throw new Error("Argument 'chars' is undefined");
  }

  var charsLength = chars.length;
  if (charsLength > 256) {
    throw new Error(
      "Argument 'chars' should not have more than 256 characters" +
        ", otherwise unpredictability will be broken"
    );
  }

  var randomBytes = crypto.randomBytes(length);
  var result = new Array(length);

  var cursor = 0;
  for (var i = 0; i < length; i++) {
    cursor += randomBytes[i];
    result[i] = chars[cursor % charsLength];
  }

  return result.join("");
}

export function randomProfilePassword() {
  return randomString(6, "abcdefghijklmnopqrstuvwxyz0123456789");
}

/**
 *
 * @param {string} email
 * @returns {Promise<{ profile: any; foundInGlobal: boolean; }>}
 */
export async function findProfileByEmail(email) {
  // Check in global
  const globalProfiles = await profileDbClient.queryDocs("appusers", {
    query: "c.profileEmail = @profileEmail",
    parameters: [{ name: "@profileEmail", value: email }],
  });

  // Result found in global Cosmos
  if (globalProfiles.length > 0) {
    return {
      profile: globalProfiles[0],
      foundInGlobal: true,
    };
  }

  const indianProfiles = await profileDbIndiaClient.queryDocs("appusers", {
    query: "c.profileEmail = @profileEmail",
    parameters: [{ name: "@profileEmail", value: email }],
  });

  // Result found in local
  if (indianProfiles.length > 0) {
    return {
      profile: indianProfiles[0],
      foundInGlobal: false,
    };
  }

  // Not found in either
  return {
    profile: undefined,
    foundInGlobal: false,
  };
}

/**
 *
 * @param {string} ProfileId
 * @returns {Promise<{ profile: any; foundInGlobal: boolean; }>}
 */
export async function findProfileById(id) {
  // Check in global
  const globalProfiles = await profileDbClient.queryDocs("appusers", {
    query: "c.id = @id",
    parameters: [{ name: "@id", value: id }],
  });

  // Result found in global Cosmos
  if (globalProfiles.length > 0) {
    return {
      profile: globalProfiles[0],
      foundInGlobal: true,
    };
  }

  const indianProfiles = await profileDbIndiaClient.queryDocs("appusers", {
    query: "c.id = @id",
    parameters: [{ name: "@id", value: id }],
  });

  // Result found in local Cosmos
  if (indianProfiles.length > 0) {
    return {
      profile: indianProfiles[0],
      foundInGlobal: false,
    };
  }

  return {
    profile: undefined,
    foundInGlobal: false,
  };
}

export function createProfileSalt() {
  return crypto.randomBytes(32).toString("base64");
}

export function createProfileHash(password, salt) {
  const sha256 = crypto.createHash("sha256");
  return sha256.update(password + salt).digest("base64");
}

export function createProfileTokenHash(token, salt) {
  const sha256 = crypto.createHash("sha256");
  return sha256.update(token + salt).digest("base64");
}

export function createProfile(email, password, name, method, country) {
  /*
  const salt = crypto.randomBytes(32).toString('base64');
  console.log('salt:' + salt);

  const sha256 = crypto.createHash('sha256');
  console.log('created sha');
  const hash = sha256.update(password + salt).digest('base64');
  console.log('hash:' + hash);
  */

  const salt = createProfileSalt();
  console.log("salt:" + salt);
  const hash = createProfileHash(password, salt);
  console.log("hash:" + hash);

  return profileDbClient.upsertDoc("appusers", {
    salt: salt,
    hash: hash,
    profileTimestamp: Date.now(),
    profileName: name,
    profileEmail: email,
    profileQuestions: {},
    profileModuleScores: {},
    profileCertificates: [],
    listOfShownNotifications: null,
    dismissedUpgradeMessage: null,
    cheatUsed: null,
    method,
    country,
  });
}

export function authenticateProfile(profile, password, tokenExpiryTime) {
  const sha256 = crypto.createHash("sha256");
  console.log("created sha");
  const hash = sha256.update(password + profile.salt).digest("base64");
  console.log("hash:" + hash);

  if (hash == profile.hash) {
    console.log("hash == profile.hash");

    let token = {
      id: profile.id,
      expiry: tokenExpiryTime,
    };

    let hash = createProfileTokenHash(JSON.stringify(token), profile.salt);
    token.hash = hash;

    return JSON.stringify(token);
  } else {
    console.log("Else");

    return null;
  }
}

export function checkProfileToken(profile, token_json) {
  let token = JSON.parse(token_json);

  let hash = token.hash;
  let token_clean = {
    id: token.id,
    expiry: token.expiry,
  };

  // console.log("token_clean", token_clean);
  let check_hash = createProfileTokenHash(
    JSON.stringify(token_clean),
    profile.salt
  );
  // console.log("check_hash", check_hash);

  return hash == check_hash;
}

/**
 *
 * @param {*} profile Profile to update
 * @param {boolean} useGlobal to use global endpoint or not
 */
export function upsertProfile(profile, useGlobal) {
  if (useGlobal) {
    return profileDbClient.upsertDoc("appusers", profile);
  } else {
    return profileDbIndiaClient.upsertDoc("appusers", profile);
  }
}

export function removeProfile(profile, useGlobal) {
  if (useGlobal) {
    return profileDbClient.deleteDoc(profile.id, profile.profileEmail);
  } else {
    return profileDbIndiaClient.deleteDoc(profile.id, profile.profileEmail);
  }
}

export function updateAndMergeBaseProfile(profile, updated_info) {
  const profileToUse =
    updated_info.profileTimestamp >= profile.profileTimestamp
      ? updated_info
      : profile;

  const { profileTimestamp, profileName, profileEmail, profileQuestions } =
    profileToUse;

  return { profileTimestamp, profileName, profileEmail, profileQuestions };
}

function takeHighestProperty(one, two) {
  const keysOne = Object.keys(one);
  const keysTwo = Object.keys(two);

  const allKeys = new Set([...keysOne, ...keysTwo]);
  const result = {};
  for (const k of allKeys) {
    result[k] = Math.max(one[k] || 0, two[k] || 0);
  }

  return result;
}

export function updateAndMergeProfileModuleScores(profile, updated_info) {
  return takeHighestProperty(
    profile.profileModuleScores || {},
    updated_info.profileModuleScores || {}
  );
}

export function updateAndMergeprofilePrepTest(certOne, certTwo) {
  return takeHighestProperty(
    certOne.profilePrepTestScores || {},
    certTwo.profilePrepTestScores || {}
  );
}

export function updateAndMergeProfileCerfiticates(profile, updated_info) {
  // console.log("updateAndMergeProfileCerfiticates -> profile: ", profile);
  // console.log("updateAndMergeProfileCerfiticates -> updated_info: ", updated_info);

  if (!profile.profileCertificates) {
    // console.log("updateAndMergeProfileCerfiticates -> IF 1");
    return updated_info.profileCertificates;
  }

  if (!updated_info.profileCertificates) {
    // console.log("updateAndMergeProfileCerfiticates -> IF 2");
    return profile.profileCertificates;
  }

  // If there is no certs on the profile or if the updated has more, then use that one and early return
  if (
    !profile.profileCertificates ||
    profile.profileCertificates.length < updated_info.profileCertificates.length
  ) {
    // console.log("updateAndMergeProfileCerfiticates -> IF 3");
    // // If the profile has the old structure, then delete that entry
    return updated_info.profileCertificates;
  }

  // If there is a certificates on the profile but it is not an array, and there an array on the updated one, use the updated one
  if (
    profile.profileCertificates &&
    !Array.isArray(profile.profileCertificates) &&
    updated_info.profileCertificates &&
    Array.isArray(updated_info.profileCertificates)
  ) {
    // console.log("updateAndMergeProfileCerfiticates -> IF 3");
    // // If the profile has the old structure, then delete that entry
    return updated_info.profileCertificates;
  }

  // Return profile.certificates if updated_certificates is empty
  if (
    updated_info.profileCertificates &&
    updated_info.profileCertificates.length === 0
  ) {
    // console.log("updateAndMergeProfileCerfiticates -> IF 4");
    return profile.profileCertificates;
  }

  // If there are the same amount of certs, then check the latest one and update is needed
  if (
    profile.profileCertificates.length ===
    updated_info.profileCertificates.length
  ) {
    // console.log("updateAndMergeProfileCerfiticates -> IF 5");
    // Create copy to not modify input
    const profileCertsCopy = [...profile.profileCertificates];
    const updatedCertsCopy = [...updated_info.profileCertificates];
    // Separate last cert and rest
    const oldCert = profileCertsCopy.pop();
    const updatedCert = updatedCertsCopy.pop();
    const rest = updatedCertsCopy; // updatedCertsCopy is now missing the last cert (stored in updatedCert)

    const merge = mergeTwoCerts(oldCert, updatedCert);
    merge.profilePrepTestScores = updateAndMergeprofilePrepTest(
      oldCert,
      updatedCert
    );

    // console.log("updateAndMergeProfileCerfiticates -> IF profile.profileCertificates.length === updated_info.profileCertificates.length -> merge: ", merge);

    return [...rest, merge];
  }

  return profile.profileCertificates;
}

export function updateAndMergeProfileOldCerfiticate(profile, updated_info) {
  if (!profile.profileCertificate) {
    return updated_info.profileCertificate;
  }

  if (!updated_info.profileCertificate) {
    return profile.profileCertificate;
  }

  return mergeTwoCerts(
    profile.profileCertificate,
    updated_info.profileCertificate
  );
}

function mergeTwoCerts(oldCert, updatedCert) {
  const merge = {};
  // Do the merging

  // merge.name = (updatedCert.name != undefined || updatedCert.name != null) ? updatedCert.name : oldCert.name;
  merge.name =
    updatedCert.name != undefined ||
    updatedCert.name != null ||
    oldCert.name != undefined ||
    oldCert.name != null
      ? updatedCert.name || oldCert.name
      : "";
  merge.unlockTimestamp = Math.max(
    updatedCert.unlockTimestamp || 0,
    oldCert.unlockTimestamp || 0
  );
  merge.score = Math.max(updatedCert.score || 0, oldCert.score || 0);
  merge.passed = !!updatedCert.passed || !!oldCert.passed || false;
  merge.claimed = !!updatedCert.claimed || !!oldCert.claimed || false;
  merge.certDate = Math.max(updatedCert.certDate || 0, oldCert.certDate || 0);
  merge.jobTitle = updatedCert.jobTitle || oldCert.jobTitle || "";
  merge.workPlace = updatedCert.workPlace || oldCert.workPlace || "";
  merge.uniqueId = updatedCert.uniqueId || oldCert.uniqueId || undefined;
  merge.memberId = updatedCert.memberId || oldCert.memberId || undefined;

  return merge;
}

export function updateAndMergeProfile(profile, updated_info) {
  // console.log("updateAndMergeProfile -> profile: ", profile);
  // console.log("updateAndMergeProfile -> updated_info: ", updated_info);

  let baseInfo = updateAndMergeBaseProfile(profile, updated_info);
  // console.log("updateAndMergeProfile -> baseInfo: ", baseInfo);
  let profileModuleScores = updateAndMergeProfileModuleScores(
    profile,
    updated_info
  );
  // console.log("updateAndMergeProfile -> profileModuleScores: ", profileModuleScores);

  // If no old profile exists, just use new one.
  if (profile === undefined) {
    return updated_info;
  }

  var result = {
    ...baseInfo,
    profileModuleScores,
    salt: profile.salt,
    hash: profile.hash,
    id: profile.id,
    country: updated_info.country || profile.country,
    profileId: updated_info.profileId,
    listOfShownNotifications:
      updated_info.listOfShownNotifications ||
      profile.listOfShownNotifications ||
      null,
    cheatUsed: updated_info.cheatUsed || profile.cheatUsed || null,
    method: updated_info.method || profile.method || "Email",
    userSpecificNotificationScheduleList:
      updated_info.userSpecificNotificationScheduleList ||
      profile.userSpecificNotificationScheduleList ||
      undefined,
    moduleCertificates:
      updated_info.moduleCertificates || profile.moduleCertificates,
  };

  if (updated_info.profileCertificate) {
    // console.log("updateAndMergeProfile -> if (updated_info.profileCertificate)");
    const profileCertificate = updateAndMergeProfileOldCerfiticate(
      profile,
      updated_info
    );
    return { ...result, profileCertificate };
  } else {
    // console.log("updateAndMergeProfile -> ELSE");
    const profileCertificates = updateAndMergeProfileCerfiticates(
      profile,
      updated_info
    );
    return { ...result, profileCertificates };
  }
}

export async function createPasswordVerification(userId, password) {
  console.log("createPasswordVerification");

  const userQuery = await profileDbClient.queryDocs("passwordVerification", {
    query: "c.userId = @userId",
    parameters: [{ name: "@userId", value: userId }],
  });

  if (!userQuery) {
    console.log("There is no user with this ID");
  } else {
    if (userQuery.length > 0) {
      deleteVerifiedPassword(userId);
    }
  }

  const salt = createProfileSalt();
  console.log("salt:" + salt);
  const hash = createProfileHash(password, salt);
  console.log("hash:" + hash);

  return await profileDbClient.upsertDoc("passwordVerification", {
    salt,
    hash,
    userId,
    timestamp: Date.now(),
    profileEmail: userId,
  });
}

export async function verifyPassword(userId, password) {
  // TODO: Implement this
  // return false;

  console.log("verifyPassword er userId, password nu: ", userId, password);

  const userQuery = await profileDbClient.queryDocs("passwordVerification", {
    query: "c.userId = @userId",
    parameters: [{ name: "@userId", value: userId }],
  });

  console.log("verifyPassword er userQuery nu: ", userQuery);

  if (!userQuery) {
    console.log("There is no user with this ID");
    return false;
  }

  let user = userQuery[0];
  // let user = userQuery[userQuery.length -1];

  console.log("verifyPassword er user nu: ", user);

  if (!user) {
    console.log("There is no profile on userID to verify password on!");
    return false;
  }

  const hashToCheck = createProfileHash(password, user.salt);
  console.log("verifyPassword er hashToCheck nu: ", hashToCheck);

  if (user.hash === hashToCheck) {
    console.log("Password match!");
    return true;
  } else {
    console.log("Password DO NOT match!");
    return false;
  }
}

export async function deleteVerifiedPassword(userId) {
  console.log("deleteVerifiedPassword");
  const userQuery = await profileDbClient.queryDocs("passwordVerification", {
    query: "c.userId = @userId",
    parameters: [{ name: "@userId", value: userId }],
  });
  if (!userQuery) {
    console.log("There is no user with this ID");
    return false;
  }
  let user = userQuery[0];
  // let user = userQuery[userQuery.length -1];
  console.log("User here: ", user);
  if (!user) {
    console.log("There is no profile on userID to delete password on!");
    return false;
  }

  return await profileDbClient.deleteDoc(user.id, userId);
}
