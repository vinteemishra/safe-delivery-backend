"use strict";

import { stampDoc, dbClient } from "../../lib/documentdb";
import { saveMapping } from "../../lib/datacollection";
import { mergeContent } from "../../lib/richdocument";
import {
  update as updateScreen,
  remove as removeScreen,
} from "../screens/screens.model";

const DRUGS = "drugs";

function getDrugs(langId, drugKey) {
  let query = "c.langId = @langId";
  let params = [{ name: "@langId", value: langId }];
  if (drugKey) {
    params.push({ name: "@drugKey", value: drugKey });
    query += " AND c.key = @drugKey";
  }
  // Order!
  query += " ORDER BY c.description";

  return dbClient.queryDocs(DRUGS, {
    query: query,
    parameters: params,
  });
}

export const mergeDrug = (langId, master, translated) => {
  if (!translated) {
    let { id, ...drug } = {
      ...master,
      langId,
      cards: mergeContent(master, translated),
    };
    return drug;
  }

  let drug = { ...translated, cards: mergeContent(master, translated) };

  return drug;
};

export function list(langId, showAll) {
  return find(undefined, langId, showAll);
}

export function find(drugKey, langId, showAll) {
  const masters = getDrugs("", drugKey, showAll);
  if (!langId) {
    return masters;
  }

  const translated = getDrugs(langId, drugKey, showAll);

  return Promise.all([masters, translated]).then((r) => {
    const [ms, ts] = r;

    const existingDrugs = new Map(ts.map((t) => [t.key, t]));

    const mergedDrugs = ms.map((m) =>
      mergeDrug(langId, m, existingDrugs.get(m.key))
    );

    // We have to filter for `included = true` here
    // since we merge with content from the master.
    return showAll ? mergedDrugs : mergedDrugs.filter((d) => d.included);
  });
}

export function update(user, drug) {
  console.log("Update drug", drug);

  return dbClient.upsertDoc(DRUGS, stampDoc(drug, user));
}

export function screenKey(drugKey) {
  return `drug:${drugKey}`;
}

export function insert(user, drug) {
  console.log("Insert drug", drug);
  return dbClient
    .upsertDoc(DRUGS, stampDoc(drug, user))
    .then((clean) => {
      // Add master screen for translating name of drug
      if (drug.langId === "") {
        return updateScreen(user, [
          { key: screenKey(drug.key), content: drug.description, langId: "" },
        ]).then(() => {
          return clean;
        });
      } else {
        return clean;
      }
    })
    .then((clean) => {
      return saveMapping("drug", clean.key, clean.description).then(
        () => clean
      );
    });
}

export function remove(drugKey) {
  return dbClient
    .queryDocs(DRUGS, {
      query: "c.key = @key",
      parameters: [{ name: "@key", value: drugKey }],
      projection: "c.id",
    })
    .then((ids) => {
      const deletes = ids.map((row) => {
        console.log("Del drug", row.id);
        return dbClient.deleteDoc(row.id);
      });

      return Promise.all([...deletes, removeScreen(screenKey(drugKey))]);
    });
}
