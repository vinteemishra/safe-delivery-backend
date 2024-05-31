import config from "../config/index";
// import log from "../config/logging";

const DocumentClient = require("documentdb-q-promises").DocumentClientWrapper;

export const client = new DocumentClient(config.documentdb.url, {
  masterKey: "" + config.documentdb.key,
});

export const dbUrl = (collection) => `dbs/${config.env}/colls/${collection}`;

const CONTENT = dbUrl("content");

// Delete internal DocumentDB properties
export const cleanDoc = (doc) => {
  let { _rid, _self, _etag, _attachments, _ts, ...res } = doc;
  return res;
};

export const stampDoc = (doc, user) => {
  const r = { ...doc, LastUpdatedBy: user, LastUpdated: Date.now() };
  return r;
};

// Simple DocumentDB abstraction that places all documents in the same collection, but provides
// a 'table' concept
export const dbClient = {
  queryDocs: (table, opts) => {
    let proj = opts.projection || "*";
    let query = `SELECT ${proj} FROM Collection c WHERE c._table = @_table`;
    let parameters = [{ name: "@_table", value: table }].concat(
      opts.parameters || []
    );

    if (opts.query) {
      query += ` AND ${opts.query}`;
    }

    if (opts.orderBy) {
      query += ` ORDER BY ${opts.orderBy}`;
    }

    // log.info(query, table);
    return client
      .queryDocuments(
        CONTENT,
        {
          query: query,
          parameters: parameters,
        },
        { enableCrossPartitionQuery: true }
      )
      .toArrayAsync()
      .then((r) => {
        // log.info("query done", table);
        return r.feed.map((d) => cleanDoc(d));
      });
  },

  upsertDoc: (table, doc) => {
    doc._table = table;
    return client
      .upsertDocumentAsync(CONTENT, doc)
      .then((r) => cleanDoc(r.resource));
  },

  deleteDoc: (docId) => {
    return client.deleteDocumentAsync(`${CONTENT}/docs/${docId}`);
  },

  readDoc: (docId) => {
    return client.readDocumentAsync(`${CONTENT}/docs/${docId}`);
  },
};
