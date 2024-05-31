"use strict";

const DocumentClient = require("documentdb").DocumentClient;

const client = new DocumentClient("https://sdacms.documents.azure.com:443/", {
  masterKey:
    "LYwIS46JsMK1LdAMWoguUFbOrUC3Pvm9bHtEmxuUqkiPiDS52xRNvKt9kkh0J2xZmhqASVK1elrJPprPGRpwsQ==",
});

client
  .queryDocuments(
    `dbs/dev/colls/content`,
    "SELECT * FROM Collection c WHERE c._table='about-test'"
  )
  .toArray((err, docs) => {
    console.log("callback docs", docs);
    const id = docs[0].id;
    const txt = docs[0].chapters[0].cards[10].translated.blocks[2];
    console.log("query txt", txt);

    client.readDocument(`dbs/dev/colls/content/docs/${id}`, (err, doc) => {
      const txt = doc.chapters[0].cards[10].translated.blocks[2];
      console.log("read txt", txt);
    });
  });
