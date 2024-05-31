"use strict";
require("babel-register/lib/node.js");
require("babel-polyfill/dist/polyfill.js");

const config = require("../server/config");

const cleanProfile = (doc) => {
  let { _rid, _self, _etag, _attachments, ...res } = doc;
  return res;
};

const documentDbClient = require("../server/lib/documentdb").client;
async function queryOriginalProfiles() {
  return documentDbClient
    .queryDocuments(
      `dbs/${config.env}/colls/content`,
      {
        query: `SELECT * FROM Collection c WHERE c._table = @_table AND is_defined(c.profileEmail)`,
        parameters: [{ name: "@_table", value: "appusers" }],
      },
      { enableCrossPartitionQuery: true }
    )
    .toArrayAsync()
    .then((r) => {
      // log.info("query done", table);
      return r.feed.map((d) => cleanProfile(d));
    });
}

const profileDbClient = require("../server/lib/profiledb").profileDbClient;

function lastMigrated(newProfileTimestamps, originalProfileId) {
  const match = newProfileTimestamps.find((n) => n.id === originalProfileId);
  if (match) {
    return match._ts;
  }
  return undefined;
}

const run = async () => {
  let count = 0;
  let copied = 0;
  let skipped = 0;
  try {
    // const originalProfileQuery = await oldDbClient.queryDocs("appusers", {query: "is_defined(c.profileEmail)"});
    const originalProfileQuery = await queryOriginalProfiles();
    const newProfileQuery = await profileDbClient.queryDocs("appusers", {
      projection: "c.id, c._ts",
    });

    console.log("number of profiles:", originalProfileQuery.length);

    for (let i = 0; i < originalProfileQuery.length; i++) {
      const cleanedProfile = cleanProfile(originalProfileQuery[i]);
      const ts = lastMigrated(newProfileQuery, cleanedProfile.id);

      if (ts === undefined || ts < cleanedProfile._ts) {
        await profileDbClient.upsertDoc("appusers", cleanedProfile);
        copied++;
      } else {
        skipped++;
      }

      count++;
      if (count % 200 === 0) {
        console.log(`Count: ${count}, skipped: ${skipped}`);
      }
    }
    console.log(`Done. Copied ${copied}, skipped ${skipped} docs`);
  } catch (e) {
    console.log("Got an error:", e);
  }
};

run();
