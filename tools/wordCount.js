"use strict";

require("babel-register/lib/node.js");
require("babel-polyfill/dist/polyfill.js");

// The three types below are all handled differently

const DOCUMENT_TABLES = [
  "about", // chapters -> cards -> content -> blocks.text
  "drugs", //             cards -> content -> blocks.text
  "action-cards", // chapters -> cards -> content -> blocks.text
  "procedures", // chapters -> cards -> content -> blocks.text
  "certificates", //             cards -> content -> blocks.text
];

const SIMPLE_TABLES = [
  "notifications", // content { count all keys }
  "screens", // content is text
];

const QUESTION_TABLES = [
  "key-learning-points", // questions[] -> (question.content, answers[].value.content)
  "cases",
];

const documentDb = require("../server/lib/documentdb");
const dbClient = documentDb.dbClient;

const countWordsInString = (str) => {
  const words = (str || "").split(" ").filter((w) => w !== "");
  // console.log(words);
  return words.length;
};

/* ************************************ *
 *          Question documents            *
 * ************************************ */

const countQuestionDocuments = async (langId) => {
  const tables = {};
  for (let i = 0; i < QUESTION_TABLES.length; i++) {
    const table = QUESTION_TABLES[i];
    let count = 0;

    const docs = await dbClient.queryDocs(table, {
      query: `c.langId = "${langId}"`,
    });
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];

      (doc.questions || []).map((q) => {
        count += countWordsInString(q.question.content); // Question text
        count += countWordsInString(q.description.content); // Description text
        q.answers.map((a) => {
          count += countWordsInString(a.value.content);
        });
      });
    }
    tables[table] = count;
  }
  return tables;
};

/* ************************************ *
 *          Simple documents            *
 * ************************************ */

const countSimpleDocuments = async (langId) => {
  const tables = {};
  for (let i = 0; i < SIMPLE_TABLES.length; i++) {
    const table = SIMPLE_TABLES[i];
    let count = 0;

    const docs = await dbClient.queryDocs(table, {
      query: `c.langId = "${langId}"`,
    });
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];

      if (typeof doc.content === "string") {
        count += countWordsInString(doc.content);
      } else if (typeof doc.content === "object") {
        count += countWordsInString(doc.content.shortDescription);
        count += countWordsInString(doc.content.longDescription);
      }
    }
    tables[table] = count;
  }
  return tables;
};

/* ************************************ *
 *          Rich documents              *
 * ************************************ */

const countWordsInCard = (card) => {
  let count = 0;
  if (card.content && card.content.blocks) {
    card.content.blocks.map((b) => {
      count += b.text ? countWordsInString(b.text) : 0;
    });
  }
  return count;
};
const countWordsInRichDocument = (doc) => {
  let wordCount = 0;

  // Iterate chapters
  (doc.chapters || []).forEach((chapter) => {
    // Iterate cards inside chapters
    (chapter.cards || []).forEach((card) => {
      wordCount += countWordsInCard(card);
    });
  });

  // Iterate cards in root
  (doc.cards || []).forEach((card) => {
    wordCount += countWordsInCard(card);
  });

  return wordCount;
};
const countRichDocuments = async (langId) => {
  const tables = {};
  for (let i = 0; i < DOCUMENT_TABLES.length; i++) {
    const table = DOCUMENT_TABLES[i];
    let count = 0;

    const docs = await dbClient.queryDocs(table, {
      query: `c.langId = "${langId}"`,
    });
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      count += countWordsInRichDocument(doc);
    }
    tables[table] = count;
  }
  return tables;
};

const countWords = async (langId) => {
  const rich = await countRichDocuments(langId);
  const simple = await countSimpleDocuments(langId);
  const questions = await countQuestionDocuments(langId);

  const wordCount = { ...rich, ...simple, ...questions };

  let totalCount = 0;
  for (const key of Object.keys(wordCount)) {
    totalCount += wordCount[key];
  }
  console.log("Wordcount:", JSON.stringify(wordCount, null, 2));
  console.log(`Total word count: ${totalCount}.`);
};

const run = async () => {
  // langId == "" is master
  // for other languages specify langId here
  countWords("");
};

run();
