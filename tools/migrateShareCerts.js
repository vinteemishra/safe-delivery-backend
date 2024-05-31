"use strict";
require("babel-register/lib/node.js");
require("babel-polyfill/dist/polyfill.js");

const config = require("../server/config");

const cleanDoc = (doc) => {
  let { _rid, _self, _etag, _attachments, ...res } = doc;
  return res;
};

const documentDbClient = require("../server/lib/documentdb").client;
async function queryShareCerts() {
  return documentDbClient
    .queryDocuments(
      `dbs/${config.env}/colls/content`,
      {
        query: `SELECT * FROM Collection c WHERE c._table = @_table`,
        parameters: [{ name: "@_table", value: "shareCert" }],
      },
      { enableCrossPartitionQuery: true }
    )
    .toArrayAsync()
    .then((r) => {
      // log.info("query done", table);
      return r.feed.map((d) => cleanDoc(d));
    });
}

const profileDbClient = require("../server/lib/profiledb").profileDbClient;

const run = async () => {
  let count = 0;
  try {
    const shareCerts = await queryShareCerts();

    console.log("number of profiles:", shareCerts.length);

    for (let i = 0; i < shareCerts.length; i++) {
      const current = cleanDoc(shareCerts[i]);
      console.log("Updating current:", current);
      await profileDbClient.upsertDoc("shareCert", current);
      count++;
    }
    console.log(`Done. Copied ${count}`);
  } catch (e) {
    console.log("Got an error:", e);
  }
};

// const cleanUp = async () => {
//     let count = 0;
//     try {
//         const shareCerts = await queryShareCerts();

//         console.log("number of profiles:", shareCerts.length);

//         for(let i=0; i<shareCerts.length; i++) {
//             const current = cleanDoc(shareCerts[i]);
//             await documentDbClient.deleteDocumentAsync(`dbs/${config.env}/colls/content/docs/${current.id}`);
//             count++
//         }
//         console.log(`Done. Deleted ${count}`);
//     } catch (e) {
//         console.log("Got an error:", e);
//     }
// }

// cleanUp();

run();
