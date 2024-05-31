'use strict';

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

require('babel-register/lib/node.js');
require('babel-polyfill/dist/polyfill.js');

// The three types below are all handled differently

const TABLES = [
    "about",
    "drugs",
    "action-cards",
    "procedures",
    "certificates",
    "notifications",
    "screens",
    "key-learning-points",
    "cases",
];


// IDs from 'production
const ENGLISH_WHO = "7cf6efab-a9d7-54d2-2cbd-ec82efe4a7da"; // Prod
// const ENGLISH_WHO = "e3116616-a17f-4884-a7f8-3993f098e5d0"; // Test

const documentDb = require('../server/lib/documentdb');
const dbClient = documentDb.dbClient;


const cleanEnglishWHOLanguage = async (langId, dryRun = true) => {
    if (dryRun) {
        console.log("Doing cleanEnglishWHOLanguage dry run");
    }

    let count = 0;
    for (let i = 0; i < TABLES.length; i++) {
        const table = TABLES[i];
        const docsWithKey = await dbClient.queryDocs(table, { query: `c.langId = "${langId}"` });
        for (let i = 0; i < docsWithKey.length; i++) {
            const doc = docsWithKey[i];
            if (dryRun === false) {
                await dbClient.deleteDoc(doc.id);
            }
            count++;
        }
    }
    console.log(`Removed ${count} documents`);
};

const countLangItems = async (langId) => {
    let total = 0;
    let status = {};
    for (let i = 0; i < TABLES.length; i++) {
        const t = TABLES[i];
        const docs = await dbClient.queryDocs(t, { query: `c.langId = "${langId}"` });
        status[t] = docs.length;
        total += docs.length;
    }
    status.total = total;
    console.log(JSON.stringify(status, null, 2));
}

const run = async () => {
    // await cleanEnglishWHOLanguage(ENGLISH_WHO, true);

    // await countLangItems("Master", "");
    // await countLangItems("");

    // await importLanguage("/Users/jeppestampe/sda-prod-backup/export-7a3f367b-99df-9bca-0b1f-100dcc14ae95-1530535800906.json", "72b97070-27ca-49ed-b0e3-e35875de046d");
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
}

run();
