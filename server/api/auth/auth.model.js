"use strict";

import { dbClient } from "../../lib/documentdb";

function clean(d) {
  let { id, _table, ...res } = d;
  return res;
}
export function getUser(azureId) {
  let query = "c.userId = @userId";
  let params = [{ name: "@userId", value: azureId }];

  return dbClient
    .queryDocs("users", {
      query: query,
      parameters: params,
    })
    .then((r) => (r.length > 0 ? clean(r[0]) : undefined));
}
