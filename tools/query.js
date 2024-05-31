"use strict";

const fs = require("fs");

require("babel-register/lib/node.js");
require("babel-polyfill/dist/polyfill.js");

const parseArguments = (arr) => {
  const result = {};
  for (let i = 0; i < arr.length; i++) {
    const arg = arr[i];
    if (arg.indexOf("=") == -1) {
      continue;
    }

    const parts = arg.split("=");
    if (parts.length > 2) {
      continue;
    }

    const key = parts[0].trim();
    const value = parts[1].trim();
    result[key] = value;
  }
  return result;
};

const COSMOS_TABLES = [
  "screens",
  "drugs",
  "action-cards",
  "about",
  "procedures",
  "modules",
  "notifications",
  "key-learning-points",
  "certificates",
  "cases",
];

const dbClient = require("../server/lib/documentdb").dbClient;

const query = async (key, langId, table, proj) => {
  if (!key) {
    return;
  }

  let tables = [].concat(COSMOS_TABLES);
  if (table) {
    tables = tables.filter((t) => t === table);
  }

  let query = `c.key = "${key}"`;
  if (langId) {
    query += ` AND c.langId = "${langId}"`;
  }

  let projection = "*";
  if (proj) {
    projection = `c.${proj.replace("c.", "").trim()}`;
  }

  let count = 0;
  for (let i = 0; i < COSMOS_TABLES.length; i++) {
    const t = COSMOS_TABLES[i];
    const docs = await dbClient.queryDocs(t, { projection, query });
    if (docs.length > 0) {
      console.log(`Found these docs in table "${t}":`);
      for (let j = 0; j < docs.length; j++) {
        const d = docs[j];
        count++;
        console.log(JSON.stringify(d, null, 2));
      }
    }
  }
  console.log(`Finished with ${count} docs found`);
};

const cliArgs = process.argv.slice(2);
const args = parseArguments(cliArgs);

try {
  query(args.key, args.langId, args.table, args.proj);
} catch (e) {
  console.error(e.stack());
}
