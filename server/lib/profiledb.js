import config from "../config/index";

const DocumentClient = require("documentdb-q-promises").DocumentClientWrapper;

const client = new DocumentClient(config.profilesDb.url, {
  masterKey: "" + config.profilesDb.key,
});

const profilesCollection = `dbs/${config.env}/colls/profiles`;

// Delete internal DocumentDB properties
const cleanDoc = (doc) => {
  let { _rid, _self, _etag, _attachments, ...res } = doc;
  return res;
};

// const stampDoc = (doc, user) => {
//   const r = {...doc, LastUpdatedBy: user, LastUpdated: Date.now()};
//   return r;
// };

// Simple DocumentDB abstraction that places all documents in the same collection, but provides
// a 'table' concept
export const profileDbClient = {
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

    return client
      .queryDocuments(
        profilesCollection,
        {
          query: query,
          parameters: parameters,
        },
        { enableCrossPartitionQuery: true }
      )
      .toArrayAsync()
      .then((r) => {
        return r.feed.map((d) => cleanDoc(d));
      });
  },

  upsertDoc: (table, doc) => {
    doc._table = table;
    return client
      .upsertDocumentAsync(profilesCollection, doc)
      .then((r) => cleanDoc(r.resource));
  },

  deleteDoc: (docId, partitionKey) => {
    return client.deleteDocumentAsync(`${profilesCollection}/docs/${docId}`, {
      partitionKey,
      enableCrossPartitionQuery: true,
    });
  },

  readDoc: (docId) => {
    return client.readDocumentAsync(`${profilesCollection}/docs/${docId}`);
  },
};
