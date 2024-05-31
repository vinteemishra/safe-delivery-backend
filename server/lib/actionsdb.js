import config from "../config/index";

const DocumentClient = require("documentdb-q-promises").DocumentClientWrapper;

const client = new DocumentClient(config.actionsDb.url, {
  masterKey: "" + config.actionsDb.key,
});

export const dbUrl = (collection) => `dbs/${config.env}/colls/${collection}`;

const CONTENT = dbUrl("content");

// Delete internal DocumentDB properties
const cleanDoc = (doc) => {
  let { _rid, _self, _etag, _attachments, ...res } = doc;
  return res;
};

// Simple DocumentDB abstraction that places all documents in the same collection, but provides
// a 'table' concept
export const actionsdbclient = {
  createItem: async (body) => {
    try {
      const result = await client
        .createDocumentAsync(CONTENT, body)
        .then((result) => result);
      return result;
    } catch (e) {
      console.log("Error here ", e);
    }
  },
  getItems: async (pageNumber, perPage) => {
    if (perPage <= 0) {
      return "Incorrect perPage value";
    }

    if (pageNumber <= 0) {
      return "Incorrect pageNumber Value";
    }
    const limit = perPage || 20;
    const offset = ((pageNumber || 1) - 1) * limit;

    const count = await client
      .queryDocuments(
        CONTENT,
        { query: "SELECT VALUE COUNT(1) FROM c" },
        { enableCrossPartitionQuery: true }
      )
      .toArrayAsync()
      .then((r) => r.feed[0]);

    const result = await client
      .queryDocuments(
        CONTENT,
        { query: `select * from c offset ${offset} limit ${limit}` },
        { enableCrossPartitionQuery: true }
      )
      .toArrayAsync()
      .then((r) => r.feed.slice(offset, r.feed.length));
    return { count, items: result };
  },
};
