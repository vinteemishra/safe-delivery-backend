"use strict";

import { mergeContent } from "./richdocument";
import { dbClient } from "./documentdb";
import { saveMapping } from "./datacollection";
import {
  update as updateScreen,
  remove as removeScreen,
} from "../api/screens/screens.model";

export const chapterScreenKey = (chapterKey) => {
  return `chapter:${chapterKey}`;
};

export const removeChapterScreens = (chapterKey) => {
  return removeScreen(chapterScreenKey(chapterKey));
};

// Sync the screens with the chapters of document:
//  - Add screen text for new chapters cards
//  - Delete screens for chapters that are removed
export const updateChapterScreens = (user, doc) => {
  return dbClient.readDoc(doc.id).then((existing) => {
    console.log("Existing", existing.resource);
    console.log("New ", doc);

    const existingChapters = new Set(
      (existing.resource.chapters || []).map((c) => c.key)
    );
    const currentChapters = new Map(doc.chapters.map((c) => [c.key, c]));

    const removedKeys = [...existingChapters].filter(
      (c) => !currentChapters.has(c)
    );
    const addedKeys = [...currentChapters.keys()].filter(
      (c) => !existingChapters.has(c)
    );

    const deletes = removedKeys.map((key) =>
      removeScreen(chapterScreenKey(key))
    );
    const inserts = updateScreen(
      user,
      addedKeys.map((key) => {
        const c = currentChapters.get(key);
        addedKeys.map((k) => saveMapping("chapter", key, c.description));
        return {
          key: chapterScreenKey(c.key),
          content: c.description,
          langId: "",
        };
      })
    );
    console.log("Remove screen keys", removedKeys);
    console.log("added  screen keys", addedKeys);
    return Promise.all([...deletes, inserts]);
  });
};

export const mergeChapters = (master, translated) => {
  const translatedChapters = new Map(
    (translated ? translated.chapters : []).map((t) => [t.key, t])
  );

  const mergedChapters = master.chapters.map((mc) => {
    let translatedChapter = translatedChapters.has(mc.key)
      ? translatedChapters.get(mc.key)
      : { ...mc, cards: [] };

    translatedChapter.cards = mergeContent(mc, translatedChapter);
    return translatedChapter;
  });

  return mergedChapters;
};
