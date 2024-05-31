import { stampDoc, dbClient } from "../../lib/documentdb";

const FEEDBACK = "feedback";

export function insert(body) {
  return dbClient.upsertDoc(FEEDBACK, body);
}

export function list(){
  return dbClient.queryDocs(FEEDBACK,{},);
}