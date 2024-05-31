"use strict";

Date.prototype.yyyymmdd = function () {
  var mm = (this.getMonth() + 1).toString();
  var dd = this.getDate().toString();

  return [
    this.getFullYear(),
    mm.length === 2 ? "" : "0",
    mm,
    dd.length === 2 ? "" : "0",
    dd,
  ].join("");
};

const util = require("util");
const fs = require("fs");

/**
 * We're separating language content form master content.
 * This should mean (but doesn't atm):
 *    - Whenever we create a new language, the whole master is copied to the new language.
 *    - Whenever we change anything in the master, it only affects languages which are marked as WHO.
 *    - In languages which are not marked as WHO, we should highlight the changes from master, and
 *      make it possible to "Import from master".
 *
 * This script traverse all languages and makes sure that all content is copied from master,
 * so every language has it's own full copy.
 *
 * This script doesn't override adapted or translated texts. Only add missing content to languages.
 * In case of missing document, the whole document is missing - not only a part of it.
 *                                         TODO: Confirm this!
 *
 */

require("babel-register/lib/node.js");
require("babel-polyfill/dist/polyfill.js");

// The three types below are all handled differently

const SECTION_TABKES = ["about"];

const DOCUMENT_TABLES = ["drugs", "action-cards", "procedures", "certificates"];

/**
 * Remember that a screen text is created for each added Video in a module
 */
const SIMPLE_TABLES = ["notifications", "screens"];

const QUESTION_TABLES = ["key-learning-points", "cases"];

const ALL_TABLES = []
  .concat(DOCUMENT_TABLES)
  .concat(SIMPLE_TABLES)
  .concat(SECTION_TABKES)
  .concat(QUESTION_TABLES);

const ALL_TABLES_WITH_KEYS = []
  .concat(DOCUMENT_TABLES)
  .concat(SIMPLE_TABLES)
  .concat(QUESTION_TABLES);

// IDs from 'production
const LANGUAGES_AND_IDS = {
  "7cf6efab-a9d7-54d2-2cbd-ec82efe4a7da": "English",
  "6a146956-9f21-206a-98cf-55db7b0a8301": "French",
  "dca15fb5-81b8-eeaa-c971-d08a7e5c7570": "South Africa",
  "3163c8ae-e97e-2ad3-986d-82868e1b342b": "Laos",
  "cca954e8-6c14-6924-6990-010cd19c7919": "Ethiopia - English",
  "49bc07fa-9ad4-816c-17db-e693a28dd40f": "India - Hindi",
  "52510488-1303-5e36-6616-cc66413a73f1": "Tanzania - English",
  "7a3f367b-99df-9bca-0b1f-100dcc14ae95": "Myanmar",
  "c212e9db-06b3-2282-a07d-d3c0c9fe12ea": "Moldova",
  "791bb5cb-192d-9a45-a03a-c4a0805caf23": "Ghana - English",
  "7ec65d25-3edc-dde4-c066-dfe92c798404": "India - English",
  "57de429d-e031-f1e6-d355-c0c8f9b53424": "Test",
  "5f06426b-f7f4-ced1-66e3-d8ab3d0881bd": "Arabic",
  "57153e33-dd43-63d8-337b-ce55028fddb6": "Kyrgyz",
  "67431a5f-a328-a334-3a79-125866630feb": "Ethiopia - Somali",
  "f3bb22c9-d64b-26e3-cbf9-e5418e905fb1": "Ethiopia - Amharic",
  "a5a16d2a-c5c4-c605-f944-1e559dfe7bdf": "Ethiopia - Oromifa",
};

const documentDb = require("../server/lib/documentdb");
const dbClient = documentDb.dbClient;
const client = documentDb.client;
const dbUrl = documentDb.dbUrl;

const CONTENT = dbUrl("content");

const deleteLanguage = async (langId) => {
  let count = 0;

  const allTables = ALL_TABLES.concat("modules");
  // Delete content from all tables
  for (let i = 0; i < allTables.length; i++) {
    const t = allTables[i];
    const docs = await dbClient.queryDocs(t, {
      query: `c.langId = "${langId}"`,
    });
    for (let j = 0; j < docs.length; j++) {
      const d = docs[j];
      // console.log("Delete this: ", d.langId, d.id);
      await dbClient.deleteDoc(d.id);
      count++;
    }
  }
  // Delete language it self
  const docs = await dbClient.queryDocs("languages", {
    query: `c.id = "${langId}"`,
  });
  for (let j = 0; j < docs.length; j++) {
    const d = docs[j];
    await dbClient.deleteDoc(d.id);
    count++;
    // console.log("Delete this: ", d.id);
  }
  console.log("Deleted this many documents", count);
};

const exportLanguage = async (langId) => {
  let count = 0;
  const documents = [];

  const allTables = ALL_TABLES.concat("modules");
  // Delete content from all tables
  for (let i = 0; i < allTables.length; i++) {
    const t = allTables[i];
    const docs = await dbClient.queryDocs(t, {
      query: `c.langId = "${langId}"`,
    });
    for (let j = 0; j < docs.length; j++) {
      const d = docs[j];
      documents.push(d);
      // console.log("Delete this: ", d.langId, d.id);
      count++;
    }
  }
  const docs = await dbClient.queryDocs("languages", {
    query: `c.id = "${langId}"`,
  });
  for (let j = 0; j < docs.length; j++) {
    const d = docs[j];
    documents.push(d);
    count++;
    // console.log("Delete this: ", d.id);
  }

  const ts = +new Date();
  const exportLangId = langId === "" ? "master" : langId;
  await util.promisify(fs.writeFile)(
    `./export-${exportLangId}-${ts}.json`,
    JSON.stringify(documents, null, 2)
  );
  console.log("Exported this many documents:", count);
};

/**
 * Imports a language as new.
 *
 * All langId's are changed for all objects.
 *
 * Note: You need to manually change the `id` field on the
 * _table=languagues entry for the new language.
 *
 * @param {string} filename name of file containing language data
 * @param {string} newLangId new UUID4 id of language
 */
const importLanguage = async (filename, newLangId) => {
  let count = 0;
  const jsonString = await util.promisify(fs.readFile)(filename);
  const data = JSON.parse(jsonString);
  console.log(`Importing ${data.length} objects`);
  for (let i = 0; i < data.length; i++) {
    const doc = data[i];
    delete doc.id;
    doc.langId = newLangId;
    if (i % 10 == 0 && i > 0) {
      process.stdout.write(".");
    }

    try {
      await client.upsertDocumentAsync(CONTENT, doc);
    } catch (e) {
      console.error("ERror!", e);
      break;
    }
    count++;
  }
  console.log(""); // Linebreak
  console.log(`Imported ${count} objects`);
};

const checkUniqueness = async (langId) => {
  const keys = {};
  for (let i = 0; i < ALL_TABLES_WITH_KEYS.length; i++) {
    const table = ALL_TABLES_WITH_KEYS[i];

    let unique = 0;
    let total = 0;
    const docs = await dbClient.queryDocs(table, {
      query: `c.langId = "${langId}"`,
    });
    for (let j = 0; j < docs.length; j++) {
      const d = docs[j];
      if (keys.hasOwnProperty(d.key)) {
        // console.log("This key contains multiple clashing documents:", d.key);
      } else {
        unique++;
      }
      total++;
      keys[d.key] = (keys[d.key] || 0) + 1;
    }
    // console.log("screen keys in master:", JSON.stringify(keys, null, 2));
    console.log(`In table ${table}, ${unique} unique out of ${total}`);
  }
  const sections = {};
  for (let i = 0; i < SECTION_TABKES.length; i++) {
    const table = SECTION_TABKES[i];

    let unique = 0;
    let total = 0;
    const docs = await dbClient.queryDocs(table, {
      query: `c.langId = "${langId}"`,
    });
    for (let j = 0; j < docs.length; j++) {
      const d = docs[j];
      if (sections.hasOwnProperty(d.section)) {
        // console.log("This key contains multiple clashing documents:", d.section);
      } else {
        unique++;
      }
      total++;
      sections[d.section] = (sections[d.section] || 0) + 1;
    }
    // console.log("screen keys in master:", JSON.stringify(keys, null, 2));
    console.log(`In table ${table}, ${unique} unique out of ${total}`);
  }
};

const cleanUpInScreens = async () => {
  const keys = {};
  let unique = 0;
  let total = 0;
  const docs = await dbClient.queryDocs("screens", { query: `c.langId = ""` });
  for (let j = 0; j < docs.length; j++) {
    const d = docs[j];
    if (keys.hasOwnProperty(d.key) && d.content !== keys[d.key]) {
      console.log(
        "Clash: ",
        JSON.stringify(d, null, 2),
        JSON.stringify(keys[d.key], null, 2)
      );
      // await dbClient.deleteDoc(keys[d.key].id);
    } else {
      unique++;
      // keys[d.key] = d;
    }
    total++;
    keys[d.key] = (keys[d.key] || 0) + 1;
  }
  // console.log("screen keys in master:", JSON.stringify(keys, null, 2));
  console.log(`Got ${unique} unique keys out of a total of ${total}`);
};

const cleanUpInAbout = async () => {
  const sections = {};
  let unique = 0;
  let total = 0;
  const docs = await dbClient.queryDocs("about", { query: `c.langId = ""` });
  for (let j = 0; j < docs.length; j++) {
    const d = docs[j];
    if (
      sections.hasOwnProperty(d.section) &&
      d.content !== sections[d.section]
    ) {
      console.log("Clash: ", d.section, d.id);
      // console.log("Clash: ", JSON.stringify(d, null, 2), JSON.stringify(sections[d.section], null, 2));
      // await dbClient.deleteDoc(sections[d.section].id);
    } else {
      sections[d.section] = d;
      unique++;
    }
    total++;
    // keys[d.section] = (keys[d.section] || 0) + 1;
  }
  // console.log("screen keys in master:", JSON.stringify(keys, null, 2));
  console.log(`Got ${unique} unique keys out of a total of ${total}`);
};

const copyCards = (cards) => {
  (cards || []).forEach((c) => {
    c.adapted = c.content;
    c.translated = c.content;
  });
  return cards;
};

const copyContentOnDocumentObject = (doc, langId) => {
  // new id
  delete doc.id;
  // update langId
  doc.langId = langId;

  // Copy simple content:
  doc.adapted = doc.content;
  doc.translated = doc.content;

  // Copy doc content
  (doc.chapters || []).forEach((c) => {
    copyCards(c.cards);
    c.adapted = c.content;
    c.translated = c.content;
  });
  (doc.cards || []).forEach((c) => {
    c.adapted = c.content;
    c.translated = c.content;
  });

  // Copy question
  (doc.questions || []).forEach((q) => {
    // copy description
    q.description.adapted = q.description.content;
    q.description.translated = q.description.content;

    // Copy question
    q.question.adapted = q.question.content;
    q.question.translated = q.question.content;

    // Copy answers
    (q.answers || []).forEach((a) => {
      a.value.adapted = a.value.content;
      a.value.translated = a.value.content;
    });
  });
  return doc;
};

const copySectionsFromMaster = async (langId, dryRun) => {
  let count = 0;
  for (let i = 0; i < SECTION_TABKES.length; i++) {
    const table = SECTION_TABKES[i];

    const masterDocs = await dbClient.queryDocs(table, {
      query: `c.langId = ""`,
    });
    for (let i = 0; i < masterDocs.length; i++) {
      const masterDoc = masterDocs[i];

      const languageDocs = await dbClient.queryDocs(table, {
        query: `c.section = "${masterDoc.section}" and c.langId = "${langId}"`,
      });
      if (languageDocs.length == 0) {
        console.log("We are gonna copy this bad boy:", masterDoc.section);
        copyContentOnDocumentObject(masterDoc, langId);

        if (dryRun === false) {
          await dbClient.upsertDoc(table, masterDoc);
        }
        count++;
        console.log(
          "Copied document from master to language",
          masterDoc.section
        );
      }
    }
  }
  return count;
};

const copyDocumentsFromMaster = async (langId, dryRun = true) => {
  if (dryRun) {
    console.log("Doing copyDocumentsFromMaster dry run");
  }

  let count = 0;
  // Handle those tables with sections instead of keys!
  count += await copySectionsFromMaster(langId, dryRun);

  for (let i = 0; i < ALL_TABLES_WITH_KEYS.length; i++) {
    const table = ALL_TABLES_WITH_KEYS[i];

    const masterDocs = await dbClient.queryDocs(table, {
      query: `c.langId = ""`,
    });
    for (let i = 0; i < masterDocs.length; i++) {
      const masterDoc = masterDocs[i];

      const languageDocs = await dbClient.queryDocs(table, {
        query: `c.key = "${masterDoc.key}" and c.langId = "${langId}"`,
      });
      if (languageDocs.length == 0) {
        console.log("We are gonna copy this bad boy:", masterDoc.key);
        copyContentOnDocumentObject(masterDoc, langId);

        if (dryRun === false) {
          await dbClient.upsertDoc(table, masterDoc);
        }
        count++;
        console.log("Copied document");
      }
    }
  }
  console.log(`Copied ${count} documents from master to language`);
};

const countLangItems = async (langId) => {
  let total = 0;
  let status = {};
  for (let i = 0; i < ALL_TABLES.length; i++) {
    const t = ALL_TABLES[i];
    const docs = await dbClient.queryDocs(t, {
      query: `c.langId = "${langId}"`,
    });
    status[t] = docs.length;
    total += docs.length;
  }
  status.total = total;
  const name = LANGUAGES_AND_IDS[langId] || langId;
  console.log(`${name}: ${JSON.stringify(status, null, 2)}`);
};

const inspectDocument = async (id) => {
  // const id = "423579fa-247e-bfb9-7ffd-7a0cd4245b6f";
  const docs = await dbClient.queryDocs("action-cards", {
    query: `c.id = "${id}"`,
  });
  const doc = docs[0];
  console.log(JSON.stringify(doc, null, 2));
};

const run = async () => {
  // await exportLanguage("67431a5f-a328-a334-3a79-125866630feb");
  // await countLangItems("Master", "");
  // await countLangItems("Hindi", "22118d52-0d78-431d-b1ba-545ee63017ca");
  // await importLanguage("/Users/jeppestampe/Development/SafeDelivery/sda-cms/export-67431a5f-a328-a334-3a79-125866630feb-1537787647924.json", "dc40648b-0a77-446b-b11b-e0aa17aed697");
  // await deleteLanguage("dc40648b-0a77-446b-b11b-e0aa17aed697");
  // await copyDocumentsFromMaster("72b97070-27ca-49ed-b0e3-e35875de046d", false);
  // await cleanUpInScreens();
  // await cleanUpInAbout();
  // await deleteLanguage("22116106-acda-43de-9305-d002db62cb6a");
  // await inspectDocument("423579fa-247e-bfb9-7ffd-7a0cd4245b6f");
  // await deleteLanguage("c56e483d-09f8-d3e5-b7b0-e9451574086c"); // Brazil
  // await checkUniqueness("22118d52-0d78-431d-b1ba-545ee63017ca");
  // await exportLanguage("");
  // // await countLangItems("dca15fb5-81b8-eeaa-c971-d08a7e5c7570");
  // await copyDocumentsFromMaster("dca15fb5-81b8-eeaa-c971-d08a7e5c7570", false); // "South Africa",
  // await copyDocumentsFromMaster("3163c8ae-e97e-2ad3-986d-82868e1b342b", false); // "Laos",
  // await copyDocumentsFromMaster("cca954e8-6c14-6924-6990-010cd19c7919", false); // "Ethiopia - English",
  // await copyDocumentsFromMaster("49bc07fa-9ad4-816c-17db-e693a28dd40f", false); // "India - Hindi",
  // await copyDocumentsFromMaster("52510488-1303-5e36-6616-cc66413a73f1", false); // "Tanzania - English",
  // await copyDocumentsFromMaster("7a3f367b-99df-9bca-0b1f-100dcc14ae95", false); // "Myanmar",
  // await copyDocumentsFromMaster("c212e9db-06b3-2282-a07d-d3c0c9fe12ea", false); // "Moldova",
  // await copyDocumentsFromMaster("791bb5cb-192d-9a45-a03a-c4a0805caf23", false); // "Ghana - English",
  // await copyDocumentsFromMaster("7ec65d25-3edc-dde4-c066-dfe92c798404", false); // "India - English",
  // await copyDocumentsFromMaster("57de429d-e031-f1e6-d355-c0c8f9b53424", false); // "Test",
  // await copyDocumentsFromMaster("57153e33-dd43-63d8-337b-ce55028fddb6", false); // "Kyrgyz",
  // await copyDocumentsFromMaster("67431a5f-a328-a334-3a79-125866630feb", false); // "Ethiopia - Somali",
  // await copyDocumentsFromMaster("f3bb22c9-d64b-26e3-cbf9-e5418e905fb1", false); // "Ethiopia - Amharic",
  // await copyDocumentsFromMaster("a5a16d2a-c5c4-c605-f944-1e559dfe7bdf", false); // "Ethiopia - Oromifa",
};

run();
