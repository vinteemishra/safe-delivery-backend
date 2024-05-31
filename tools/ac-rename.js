"use strict";
require("babel-register");
require("babel-polyfill");
var csv = require("csv-array");
var toTitleCase = require("to-title-case");

import { dbClient } from "../server/lib/documentdb";

csv.parseCSV("tools/Action_Cards_naming_and_image_links.csv", function (data) {
  data.forEach((line) => {
    console.log(line);
    dbClient
      .queryDocs("action-cards", {
        query: "c.key = @key",
        parameters: [{ name: "@key", value: line.key }],
      })
      .then((docs) => {
        const name = toTitleCase(line.name);
        const icon = `/icon/actioncard/${line.icon}`;

        docs.forEach((doc) => {
          console.log(doc);
          doc.description = name;
          doc.icon = icon;
          console.log(doc);
          dbClient.upsertDoc("action-cards", doc).then((r) => {
            console.log("result", r);
          });
        });
      });
  });
});
