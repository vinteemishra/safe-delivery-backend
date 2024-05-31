/* eslint-disable no-console */
"use strict";

import { dbClient } from "../../lib/documentdb";
import * as datacollection from "../../lib/datacollection";

// const datacollection = require('../server/lib/datacollection');

const COSMOS_TABLES = [
  ,
  // ,'screens'
  "languages",
  "drugs",
  "action-cards",
  "procedures",
  "modules",
  "notifications",
  "key-learning-points",
  "certificates",
  "cases",
  "onboarding",
];

function getMappingsValue(table, doc) {
  if (table === "screens") {
    return doc.content;
  }

  if (table === "cases") {
    return doc.comment;
  }

  if (table === "onboarding") {
    return doc.description.content;
  }

  if (table === "notifications") {
    return doc.content.shortDescription || doc.content.longDescription;
  }

  return doc.description;
}

function getType(table) {
  switch (table) {
    case "action-cards":
      return "actioncard";
    case "languages":
      return "language";
    case "drugs":
      return "drug";
    case "procedures":
      return "procedure";
    case "modules":
      return "module";
    case "notifications":
      return "notification";
    case "key-learning-points":
      return "key-learning-point";
    case "certificates":
      return "certificate";
    case "cases":
      return "case";
    case "onboarding":
      return "onboarding";
    default:
      return table;
  }
}

function saveMapping(table, key, value) {
  const type = getType(table);
  return datacollection.saveMapping(type, key, value);
}

const extractChapterMappings = async (table, doc) => {
  if (doc.chapters !== undefined) {
    for (let i = 0; i < doc.chapters.length; i++) {
      const c = doc.chapters[i];
      // console.log('Checking...', JSON.stringify(c));
      if (
        c.key !== undefined &&
        c.description !== undefined &&
        c.key.trim() !== "" &&
        c.description.trim() !== ""
      ) {
        await saveMapping(table, c.key, c.description);
      }
    }
  }
};

const extractMappingsFromTable = async (table) => {
  const queryObj = table === "languages" ? {} : { query: 'c.langId = ""' }; // languages have no langId property, otherwise only master, e.g. langId = ''

  const docs = await dbClient.queryDocs(table, queryObj);
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];

    const key = d.key || d.section || d.id;
    if (key === undefined) {
      console.log("Warn: Missing key:", JSON.stringify(d));
    }

    const value = getMappingsValue(table, d);
    try {
      await saveMapping(table, key, value);
      // console.log("Save mapping:", table, key, value)
    } catch (e) {
      // console.log(`${key} mapping already exists`);
    }

    // Also map chapters:
    extractChapterMappings(table, d);
  }
  // console.log("Save mapping:", table, key, value)
};

export const runMappingsUpdate = async () => {
  for (let i = 0; i < COSMOS_TABLES.length; i++) {
    const t = COSMOS_TABLES[i];
    await extractMappingsFromTable(t);
  }
};

export const updateMappings = async (ctx) => {
  try {
    await runMappingsUpdate();
    ctx.body = { msg: "Done" };
  } catch (e) {
    ctx.status = 500;
    ctx.body = { error: e };
  }
};
