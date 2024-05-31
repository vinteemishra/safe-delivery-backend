"use strict";

import { stampDoc, dbClient } from "../../lib/documentdb";
import { mergeContent } from "../../lib/richdocument";

const ABOUT = "about";
export const sections = [
  "introduction",
  "developers",
  "thankyou",
  "copyright",
  "disclaimer",
  "welcome",
  "upq-introduction",
  "upq-thankyou",
  "comingsoon",
  "lp-introduction",
  "background-survey",
  "feedback-and-troubleshooting",
];

function getSection(langId, section) {
  return dbClient.queryDocs(ABOUT, {
    query: "c.langId = @langId AND c.section=@section",
    parameters: [
      { name: "@langId", value: langId },
      { name: "@section", value: section },
    ],
  });
}

export function list(langId, section) {
  const master = getSection("", section);

  if (!langId) {
    return master;
  }

  const translated = getSection(langId, section);

  return Promise.all([master, translated]).then((r) => {
    const [ms, ts] = r;
    // If no master, don't return any translation
    if (ms.length == 0) return [];

    let t =
      ts.length == 0
        ? { langId: langId, section: section, chapters: [] }
        : ts[0];

    const masterChapter = ms[0].chapters[0];
    const translatedChapter = t.chapters ? t.chapters[0] : undefined;
    t.chapters = [
      {
        ...masterChapter,
        cards: mergeContent(masterChapter, translatedChapter),
      },
    ];
    return [t];
  });
}

export function update(user, section, item) {
  console.log("update", item);

  return dbClient.upsertDoc(ABOUT, {
    ...stampDoc(item, user),
    section: section,
  });
}
