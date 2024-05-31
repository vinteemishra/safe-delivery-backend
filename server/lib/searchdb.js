"use strict";

import config from "../config/index";
import log from "../config/logging";

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

export const searchdbClient = {
    queryDocs: (searchString, searchType) => {
        let query = "";
        if (!searchString) {
            searchString = "";
        }

        if (searchType == "drugs") {
            query = `SELECT distinct c.key,c._table,c.description 
      FROM c JOIN (SELECT VALUE ToString(ARRAY(SELECT DISTINCT VALUE 
        TRIM(LOWER(f.content.blocks[0].text)))) FROM f IN c.cards) T 
        where T like LOWER('%${searchString}%') and c.langId = '' 
        and c._table = 'drugs'`;
        } else {
            query = `SELECT distinct c.key,c._table,c.description 
      FROM c JOIN (SELECT VALUE
        ToString(ARRAY(SELECT DISTINCT VALUE TRIM(LOWER(f.cards[0].content.blocks[0].text))))
        FROM f IN c.chapters) T where T like LOWER('%${searchString}%')
        and  c.langId = '' and 
        c._table  = '${searchType}'`;
        }
        //log.info(query, table);
        return client
            .queryDocuments(
                CONTENT, { query: query }, { enableCrossPartitionQuery: true }
            )
            .toArrayAsync()
            .then((r) => {
                //log.info("query done", table);
                return r.feed.map((d) => cleanDoc(d));
            });
    },
};