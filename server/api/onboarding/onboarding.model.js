"use strict";

import { stampDoc, dbClient } from "../../lib/documentdb";

const ONBOARDING = "onboarding";

function getScreens(langId, screenKey) {
  let query = "c.langId = @langId";
  let params = [{ name: "@langId", value: langId }];
  if (screenKey) {
    params.push({ name: "@sKey", value: screenKey });
    query += " AND c.key = @sKey";
  }
  //   // Order!
  //   query += ' ORDER BY c.description';

  return dbClient.queryDocs(ONBOARDING, {
    query: query,
    parameters: params,
  });
}

export function list(langId) {
  return find(langId, undefined);
}

export async function find(langId, screenKey) {
  const masters = await getScreens("", screenKey);
  if (!langId) {
    return masters;
  }

  const translated = await getScreens(langId, screenKey);
  return masters.map((m) => mergeScreen(langId, m, translated));
}

const mergeScreen = (langId, screenFromMaster, listOfTranslatedScreens) => {
  let translatedScreen = (listOfTranslatedScreens || []).find(
    (t) => t.key === screenFromMaster.key && t.langId === langId
  );

  // We have no tranlation - we create a new translated screen object.
  if (translatedScreen === undefined) {
    const { LastUpdatedBy, key, _table, LastUpdated, description } =
      screenFromMaster;
    translatedScreen = {
      langId,
      LastUpdatedBy,
      key,
      _table,
      LastUpdated,
      description,
    };
  }

  const question = mergeTranslatedText(
    screenFromMaster.question,
    translatedScreen.question
  );
  // const bodyText = mergeTranslatedText(screenFromMaster.bodyText, translatedScreen.bodyText);
  const answers = mergeAnswers(
    screenFromMaster.answers,
    translatedScreen.answers
  );
  // const link = mergeTranslatedText(screenFromMaster.link, translatedScreen.link);

  // Filling in all the translated texts..
  let onboardingScreen = { ...translatedScreen, question, answers };
  return onboardingScreen;
};

const mergeTranslatedText = (masterText, translatedText) => {
  // Use all content from master if no translated text exists
  if (!translatedText) {
    return {
      content: masterText.content,
      adapted: masterText.content,
      translated: masterText.content,
      // href: masterText.href
    };
  }

  return {
    // ...translatedText, content: masterText.content, href: masterText.href
    ...translatedText,
    content: masterText.content,
  };
};

const mergeAnswers = (masterAnswers, translatedAnswers) => {
  const getTranslatedAnswer = (index) => {
    if (!translatedAnswers) {
      return undefined;
    }
    if (index >= translatedAnswers.length) {
      return undefined;
    }
    return translatedAnswers[index];
  };

  return masterAnswers.map((masterAnswer, index) => {
    const translatedAnswer = getTranslatedAnswer(index);
    return mergeTranslatedText(masterAnswer, translatedAnswer);
  });
};

export function update(user, onboardingScreen) {
  console.log("Update screen", onboardingScreen);

  return dbClient.upsertDoc(ONBOARDING, stampDoc(onboardingScreen, user));
}

export async function insert(user, onboardingScreen) {
  const result = await dbClient.upsertDoc(
    ONBOARDING,
    stampDoc(onboardingScreen, user)
  );
  console.log("Insert screen", onboardingScreen, result);
  return result;
}

export async function remove(key) {
  let query = "c.key = @key";
  let params = [{ name: "@key", value: key }];

  // if (langId) {
  //     query += " AND c.langId = @langId"
  //     params.push({ name: "@langId", value: langId });
  // }

  const ids = await dbClient.queryDocs(ONBOARDING, {
    query: query,
    projection: "c.id",
    parameters: params,
  });

  const deletes = ids.map((row) => {
    return dbClient.deleteDoc(row.id);
  });

  return deletes;
}
