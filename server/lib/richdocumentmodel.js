"use strict";

import { stampDoc, dbClient } from "./documentdb";
import { saveMapping } from "./datacollection";
import {
  mergeChapters,
  updateChapterScreens,
  removeChapterScreens,
} from "./chapters";
import {
  update as updateScreen,
  remove as removeScreen,
} from "../api/screens/screens.model";
import { list as listModules } from "../api/modules/modules.model";

// Generic model for documents containing chapters of rich text
export class RichDocumentModel {
  constructor(docType, propName, plural) {
    this.docType = docType;
    this.docTypePlural = plural || `${docType}s`;
    this.docTypeProperty = propName || this.docTypePlural;
  }

  // Add any missing properties
  static augmentDoc(c) {
    return { ...{ chapters: [] }, ...c };
  }

  getDocs(langId, docKey) {
    let query = "c.langId = @langId";
    let params = [{ name: "@langId", value: langId }];
    if (docKey) {
      params.push({ name: "@docKey", value: docKey });
      query += " AND c.key = @docKey";
    }

    return dbClient
      .queryDocs(this.docTypePlural, {
        query: query,
        parameters: params,
      })
      .then((ds) => ds.map(RichDocumentModel.augmentDoc));
  }

  static mergeDoc(langId, master, translated) {
    if (!translated) {
      let { id, ...doc } = {
        ...master,
        langId: langId,
        chapters: mergeChapters(master, translated),
      };
      return doc;
    }

    let doc = { ...translated, chapters: mergeChapters(master, translated) };

    return doc;
  }

  documentIsReferencedInModule(m, key) {
    const docs = m[this.docTypeProperty];
    return docs && docs.some((k) => k === key);
  }

  documentIsReferenced(mods, key) {
    return mods.some((m) => this.documentIsReferencedInModule(m, key));
  }

  find(docKey, langId, role, findAll) {
    const masters = this.getDocs("", docKey);
    if (!langId) {
      return masters;
    }

    const translated = this.getDocs(langId, docKey);

    const langModules = findAll
      ? Promise.resolve([2])
      : listModules(langId, role);
    return Promise.all([masters, translated, langModules]).then((r) => {
      const [ms, ts, langModules] = r;

      const existingDocs = new Map(ts.map((t) => [t.key, t]));

      const mergedDocs = ms.map((m) =>
        RichDocumentModel.mergeDoc(langId, m, existingDocs.get(m.key))
      );

      return findAll
        ? mergedDocs
        : mergedDocs.filter((doc) =>
            this.documentIsReferenced(langModules, doc.key)
          );
    });
  }

  list(langId, role, listAll) {
    return this.find(undefined, langId, role, listAll);
  }

  update(user, doc) {
    console.log("Update doc", doc);

    const p =
      doc.langId === "" ? updateChapterScreens(user, doc) : Promise.resolve(1);

    return p.then(() =>
      dbClient.upsertDoc(this.docTypePlural, stampDoc(doc, user))
    );
  }

  screenKey(docKey) {
    return `${this.docType}:${docKey}`;
  }

  insert(user, doc) {
    console.log("Insert doc", doc);
    if (doc.id)
      throw `docType ${this.docType} doc ${doc.description} already has id ${doc.id}`;

    return dbClient
      .upsertDoc(this.docTypePlural, stampDoc(doc, user))
      .then((clean) => {
        // Add master screen for translating name of doc
        if (doc.langId === "") {
          return updateScreen(user, [
            {
              key: this.screenKey(doc.key),
              content: doc.description,
              langId: "",
            },
          ]).then(() => {
            return clean;
          });
        } else {
          return clean;
        }
      })
      .then((clean) => {
        return saveMapping(
          this.docType.replace(/\-/g, ""),
          clean.key,
          clean.description
        ).then(() => clean);
      });
  }

  remove(docKey) {
    return dbClient
      .queryDocs(this.docTypePlural, {
        query: "c.key = @key",
        parameters: [{ name: "@key", value: docKey }],
      })
      .then((docs) => {
        const deletes = docs.map((doc) => {
          // Delete screens for all chapters
          const chapterDeletes = doc.chapters
            ? doc.chapters.map((chapter) => {
                console.log("Del chapter", chapter.key);
                return removeChapterScreens(chapter.key);
              })
            : [];

          console.log("Del doc", doc.id);
          return Promise.all([dbClient.deleteDoc(doc.id), ...chapterDeletes]);
        });

        return Promise.all([...deletes, removeScreen(this.screenKey(docKey))]);
      });
  }
}
