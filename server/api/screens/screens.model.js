"use strict";

import { stampDoc, dbClient } from "../../lib/documentdb";
import { list as listModules } from "../modules/modules.model";
import { actionCardsModel } from "../action-cards/action-cards.model";
import { proceduresModel } from "../procedures/procedures.model";

const SCREENS = "screens";

function getMasters() {
  return dbClient.queryDocs(SCREENS, {
    query: "c.langId = ''",
    orderBy: "c.key",
  });
}

function screenIsReferencedInModule(m, property, key) {
  const refs = m[property];
  return refs && refs.some((k) => k === key);
}

function screenIsReferenced(mods, chapters, key) {
  const [prefix, suffix] = key.split(":");

  if (!suffix) {
    // Global screen key, always referenced
    return true;
  }

  let property;
  switch (prefix) {
    case "action-card":
      property = "actionCards";
      break;
    case "procedure":
      property = "procedures";
      break;
    case "video":
      property = "videos";
      break;
    case "module":
      return mods.some((m) => m.key === suffix);
    case "chapter":
      return chapters.some((c) => c.key === suffix);
    default:
      return true;
  }

  return mods.some((m) => screenIsReferencedInModule(m, property, suffix));
}

function findChapters(langId, role) {
  return Promise.all([
    actionCardsModel.list(langId, role, false),
    proceduresModel.list(langId, role, false),
  ]).then((r) => {
    const [acs, pps] = r;

    const flattenedChapters = acs
      .concat(pps)
      .map((doc) => doc.chapters || [])
      .reduce((a, b) => a.concat(b), []);

    return flattenedChapters;
  });
}

export function list(langId, role, listAll) {
  const masters = getMasters();

  let result;

  if (langId === "") {
    result = masters;
  } else {
    const translated = dbClient
      .queryDocs(SCREENS, {
        query: "c.langId = @langId",
        parameters: [{ name: "@langId", value: langId }],
      })
      .then((r) => new Map(r.map((d) => [d.key, d])));

    const langModules = listAll ? Promise.resolve([]) : listModules(langId, "");

    const langChapters = listAll
      ? Promise.resolve([])
      : findChapters(langId, "");

    // Merge masters & translated, ensure to update master content
    result = Promise.all([masters, translated, langModules, langChapters]).then(
      (r) => {
        const [ms, ts, langModules, langChapters] = r;
        const masterMap = new Map(ms.map((m) => [m.key, m]));
        const masterScreens = ms.map((screen) => {
          if (ts.has(screen.key)) {
            return { ...ts.get(screen.key), content: screen.content };
          } else
            return {
              ...screen,
              id: undefined,
              langId: langId,
              adapted: screen.content,
              translated: screen.content,
            };
        });

        // Add language specific screens (such as video descriptions)
        const languageScreens = Array.from(ts.values()).filter(
          (screen) => !masterMap.has(screen.key)
        );

        const allScreens = masterScreens.concat(languageScreens);
        return listAll
          ? allScreens
          : allScreens.filter((screen) =>
              screenIsReferenced(langModules, langChapters, screen.key)
            );
      }
    );
  }
  return result.then((screens) => {
    return screens
      .filter((s) => s.content !== "")
      .sort((a, b) => {
        return (
          (a.content === "") - (b.content === "") ||
          +(a.key > b.key) ||
          -(a.key < b.key)
        );
      });
  });
}

export function update(user, items) {
  let upserts = items.map((i) =>
    dbClient.upsertDoc(SCREENS, stampDoc(i, user))
  );
  return Promise.all(upserts);
}

// Remove all screens with the specified key and langId if specified
export function remove(screenKey, langId) {
  let query = "c.key = @key";
  let params = [{ name: "@key", value: screenKey }];

  if (langId) {
    query += " AND c.langId = @langId";
    params.push({ name: "@langId", value: langId });
  }

  return dbClient
    .queryDocs(SCREENS, {
      query: query,
      projection: "c.id",
      parameters: params,
    })
    .then((ids) => {
      const deletes = ids.map((row) => {
        console.log("Del screen", row.id);
        return dbClient.deleteDoc(row.id);
      });
      return Promise.all(deletes);
    });
}
