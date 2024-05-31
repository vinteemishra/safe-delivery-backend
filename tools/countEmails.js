"use strict";

const fs = require("fs");

require("babel-register/lib/node.js");
require("babel-polyfill/dist/polyfill.js");

const dbClient = require("../server/lib/documentdb").dbClient;

const checkUserProfiles = () =>
  new Promise((res, rej) => {
    const emails = {};
    dbClient.queryDocs("appusers", {}).then((docs) => {
      let count = 0;
      docs.map((d) => {
        const mail = d.profileEmail;
        if (mail && mail in emails) {
          console.log("Found dublicate:", mail, emails[mail]);
          count++;
        } else {
          emails[mail] = d.id;
        }
      });
      console.log("Found ", count, " appusers with emails");
      res();
    });
  });

// Run everything
checkUserProfiles();
