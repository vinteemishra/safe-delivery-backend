"use strict";

import { searchdbClient } from "./../../lib/searchdb";

export function searchResult(searchString, type) {
  return searchdbClient.queryDocs(searchString, type);
}
