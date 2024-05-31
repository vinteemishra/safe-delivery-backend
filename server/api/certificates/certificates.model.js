"use strict";

import { stampDoc, dbClient } from "../../lib/documentdb";
import { saveMapping } from "../../lib/datacollection";
import { mergeContent } from "../../lib/richdocument";
import { casesModel } from "../cases/cases.model";

const CERT = "certificates";
const caseIds = [];

function getCerts(langId, certKey) {
  let query = "c.langId = @langId";
  let params = [{ name: "@langId", value: langId }];
  if (certKey) {
    params.push({ name: "@certKey", value: certKey });
    query += " AND c.key = @certKey";
  }

  let certificates = dbClient.queryDocs(CERT, {
    query: query,
    parameters: params,
  });

  // FIXME: Currently there's only one certificate. All cases are used at the moment.
  let caseKeys = casesModel
    .list(langId, "admin", true)
    .then((cases) => cases.map((c) => c.key));

  return Promise.all([certificates, caseKeys]).then((r) => {
    const [certs, keys] = r;
    return certs.map((caze) => {
      return { ...caze, cases: keys };
    });
  });
}

export function list(langId) {
  return find(undefined, langId);
}

export function find(certKey, langId) {
  const masters = getCerts("", certKey);
  if (!langId) {
    return masters;
  }

  const translated = getCerts(langId, certKey);

  return Promise.all([masters, translated]).then((r) => {
    const [ms, ts] = r;
    const existingCerts = new Map(ts.map((t) => [t.key, t]));
    const mergedCerts = ms.map((m) =>
      mergeCert(langId, m, existingCerts.get(m.key))
    );

    return mergedCerts;
  });
}

export const mergeCert = (langId, master, translated) => {
  if (!translated) {
    let { id, ...cert } = {
      ...master,
      langId: langId,
      cards: mergeContent(master, translated),
    };
    return cert;
  }
  let LastUpdated = Math.max(master.LastUpdated, translated.LastUpdated);
  return {
    ...translated,
    LastUpdated,
    cards: mergeContent(master, translated),
  };
};

export function insert(user, cert) {
  console.log("Insert cert", cert);
  return dbClient.upsertDoc(CERT, stampDoc(drug, user)).then((clean) => {
    return saveMapping("certificate", clean.key, clean.description).then(
      () => clean
    );
  });
}

export function update(user, cert) {
  return dbClient.upsertDoc(CERT, stampDoc(cert, user));
}

export function remove(certKey) {
  return dbClient
    .queryDocs(CERT, {
      query: "c.key = @key",
      parameters: [{ name: "@key", value: certKey }],
      projection: "c.id",
    })
    .then((ids) => {
      const deletes = ids.map((row) => {
        console.log("Del cert", row.id);
        return dbClient.deleteDoc(row.id);
      });

      return Promise.all(deletes);
    });
}
