"use strict";

require("babel-register/lib/node.js");
require("babel-polyfill/dist/polyfill.js");

const dbClient = require("../server/lib/documentdb").dbClient;

const languages = {};

const run = async () => {
  const langQuery = await dbClient.queryDocs("languages", {});
  langQuery.forEach((lang) => {
    languages[lang.id] = {
      id: lang.id,
      name: lang.description,
      modules: {},
    };
  });

  const modules = await dbClient.queryDocs("modules", {});
  modules.forEach((module) => {
    const { langId, actionCards, procedures, videos, drugs } = module;
    if (langId in languages) {
      languages[langId].modules[module.key] = {
        actionCards,
        procedures,
        videos,
        drugs,
      };
    }
  });

  const final = {};

  Object.values(languages).forEach((lang) => {
    final[lang.name] = lang;
  });

  console.log("languages:", JSON.stringify(final, null, 2));
};

run();
