"use strict";

require("babel-register/lib/node.js");
require("babel-polyfill/dist/polyfill.js");

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
  "onboarding",
];

const dbClient = require("../server/lib/documentdb").dbClient;

// USAGE:
//
// - Create a new language in the CMS with the desired destination Name and Asset choice.
//
// - Insert the language id from the language you want to copy and the language id from the newly created language below
//
// - Run the script from sda-cms root directory:
//       $ NODE_ENV=production node tools/duplicateLanguage.js

const sourceLangId = "7cf6efab-a9d7-54d2-2cbd-ec82efe4a7da"; // English
const destinationLangId = "bbc233f1-408e-118e-9acb-f6cf63f9b999"; //Safe-Abortion Pilot English

const deleteModulesFromDestinationLanguage = async (destinationLangId) => {
  const docs = await dbClient.queryDocs("modules", {
    query: `c.langId = "${destinationLangId}"`,
  });
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];

    await dbClient.deleteDoc(d.id);
    console.log("Module deleted");
  }
};

const copyTable = async (sourceLangId, destinationLangId, table) => {
  console.log(`Copying table ${table}`);
  const docs = await dbClient.queryDocs(table, {
    query: `c.langId = "${sourceLangId}"`,
  });
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];

    delete d.id;
    d.langId = destinationLangId;

    await dbClient.upsertDoc(table, d);
  }
  console.log(`Copied ${docs.length} documents from/to table: ${table}`);
};

const copyLanguage = async (sourceLangId, destinationLangId) => {
  // Remove old modules
  await deleteModulesFromDestinationLanguage(destinationLangId);

  // Copy all relevant tables
  for (let i = 0; i < COSMOS_TABLES.length; i++) {
    const t = COSMOS_TABLES[i];
    await copyTable(sourceLangId, destinationLangId, t);
  }
  console.log("Done copying");
};

const countLangItems = async (name, langId) => {
  let total = 0;
  let status = {};
  for (let i = 0; i < COSMOS_TABLES.length; i++) {
    const t = COSMOS_TABLES[i];
    const docs = await dbClient.queryDocs(t, {
      query: `c.langId = "${langId}"`,
    });
    status[t] = docs.length;
    total += docs.length;
  }
  status.total = total;
  console.log(`"${name}": ${JSON.stringify(status, null, 2)}`);
};

const run = async () => {
  await copyLanguage(sourceLangId, destinationLangId);
  await countLangItems("Source", sourceLangId);
  await countLangItems("Dest", destinationLangId);
};

run();

/**
 * BEWARE: Deletes a complete language!
 */
// const deleteCompleteLanguage = async (langId) => {
//     for (let i = 0; i < COSMOS_TABLES.length; i++) {
//         const t = COSMOS_TABLES[i];
//         const docs = await dbClient.queryDocs(t, { query: `c.langId = "${langId}"` });
//         for (let j = 0; j < docs.length; j++) {
//             const d = docs[j];
//             console.log("Delete this: ", d.langId, d.id);
//             await dbClient.deleteDoc(d.id);
//         }
//     }
// }

// const all = async () => {
//     await countLangItems("Ethiopia - English", "cca954e8-6c14-6924-6990-010cd19c7919");
//     await countLangItems("Ethiopia - Somali", "f8dbed50-5486-c16f-9d7d-36dac8d580c1");
//     await countLangItems("Ethiopia - Amharic", "38ac2f1c-d34f-af85-c9bb-d4225d5d4ab8");
//     await countLangItems("Ethiopia - Oromifa", "cbcafdf0-1937-63ae-3b58-39418ab7a00d");
// }
// all();

/**
 * The version below is more complex - but can copy the adapted version into the translated text.
 */
/*
const queryConf = {
    query: `c.langId = "${langIdToCopy}"`
}

const copyModules = async (destinationLangId) => {
    const docs = await dbClient.queryDocs('modules', queryConf);
    for (let i = 0; i < docs.length; i++) {
        const d = docs[i];

        delete d.id;
        d.langId = destinationLangId;
        await dbClient.upsertDoc('modules', d);
        console.log("Module copied");
    }
};

const copyScreens = async (destinationLangId) => {
    const docs = await dbClient.queryDocs('screens', queryConf);
    for (let i = 0; i < docs.length; i++) {
        const d = docs[i];

        delete d.id;
        d.langId = destinationLangId;
        // d.translated = d.adapted;
        await dbClient.upsertDoc('screens', d);
        await console.log("Screen copied");
    }
};

const copyAbout = async (destinationLangId) => {
    const docs = await dbClient.queryDocs('about', queryConf);
    for (let i = 0; i < docs.length; i++) {
        const d = docs[i];

        delete d.id;
        d.langId = destinationLangId;
        // d.chapters = d.chapters.map(chapter => {
        //     chapter.cards = chapter.cards.map(c => {
        //         c.translated = c.adapted;
        //         return c;
        //     })
        //     return chapter;
        // });
        await dbClient.upsertDoc('about', d);
        console.log("About copied");
    }
};

const copyNotifications = async (destinationLangId) => {
    const docs = await dbClient.queryDocs('notifications', queryConf)
    for (let i = 0; i < docs.length; i++) {
        const d = docs[i];

        delete d.id;
        d.langId = destinationLangId;
        // d.translated = d.adapted;
        await dbClient.upsertDoc('notifications', d);
        console.log("Notification copied");
    }
}

const copyDrugs = async (destinationLangId) => {
    const docs = await dbClient.queryDocs('drugs', queryConf);
    for (let i = 0; i < docs.length; i++) {
        const d = docs[i];

        delete d.id;
        d.langId = destinationLangId;
        // d.cards = d.cards.map(card => {
        //     card.translated = card.adapted;
        //     return card;
        // });
        await dbClient.upsertDoc('drugs', d);
        console.log("Drug copied");
    }
}

const copyActionCards = async (destinationLangId) => {
    const docs = await dbClient.queryDocs('action-cards', queryConf);
    for (let i = 0; i < docs.length; i++) {
    const d = docs[i];

        delete d.id;
        d.langId = destinationLangId;
        // d.chapters = d.chapters.map(chapter => {
        //     chapter.cards = chapter.cards.map(card => {
        //         card.translated = card.adapted;
        //         return card;
        //     })
        //     return chapter;
        // });
        await dbClient.upsertDoc('action-cards', d);
        console.log("Action card copied");
    }
}

const copyPracticalProcedures = async (destinationLangId) => {
    const docs = await dbClient.queryDocs('procedures', queryConf);
    for (let i = 0; i < docs.length; i++) {
        const d = docs[i];

        delete d.id;
        d.langId = destinationLangId;
        // d.chapters = d.chapters.map(chapter => {
        //     chapter.cards = chapter.cards.map(card => {
        //         card.translated = card.adapted;
        //         return card;
        //     })
        //     return chapter;
        // });
        await dbClient.upsertDoc('procedures', d);
        console.log("Practical procedure copied");
    }
}
*/
