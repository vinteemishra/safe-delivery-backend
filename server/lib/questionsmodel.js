"use strict";

import { stampDoc, dbClient } from "../lib/documentdb";
import { list as listModules } from "../api/modules/modules.model";

// Generic model for documents containing questions
export class QuestionsModel {
  constructor(docType, propName, plural) {
    this.docType = docType;
    this.docTypePlural = plural || `${docType}s`;
    this.docTypeProperty = propName || this.docTypePlural;
  }

  getDocs(langId, key) {
    let query = "c.langId = @langId";
    let params = [{ name: "@langId", value: langId }];
    if (key) {
      params.push({ name: "@key", value: key });
      query += " AND c.key = @key";
    }

    return dbClient.queryDocs(this.docTypePlural, {
      query: query,
      parameters: params,
    });
  }

  mergeQuestions(master, translated) {
    const tqs = new Map(
      translated ? translated.questions.map((t) => [t.key, t]) : []
    );

    const mergedQs = (master.questions || []).map((mq) => {
      const newQ = tqs.has(mq.key) ? { ...tqs.get(mq.key) } : { ...mq };

      newQ.question.content = mq.question.content;
      newQ.description.content = mq.description.content;
      // always take image and essential from master
      newQ.image = mq.image;
      if (mq.essential) {
        newQ.essential = mq.essential;
      }

      if (!tqs.has(mq.key)) {
        const q = newQ.question;
        q.adapted = q.translated = mq.question.content;
        const d = newQ.description;
        d.adapted = d.translated = mq.description.content;
      }

      // Cannot have more answers in newQ than we have in master
      if (newQ.answers && newQ.answers.length > mq.answers.length) {
        newQ.answers.splice(mq.answers.length);
      }

      // Missing questions from master
      if (newQ.answers && newQ.answers.length < mq.answers.length) {
        const missing = mq.answers
          .slice(newQ.answers.length, mq.answers.length)
          .map((m) => {
            m.value.adapted = m.value.translated = m.value.content;
            return m;
          });
        newQ.answers = [...newQ.answers, ...missing];
      }

      for (let i = 0; i < mq.answers.length; i++) {
        // This is new!
        const a = newQ.answers[i] || { value: {} };
        const ma = mq.answers[i];
        // if (a === undefined) { continue; }

        // Use result type from master
        if (ma.result) {
          a.result = ma.result; // TODO: This line crashes with the cases..
        }

        a.value.content = ma.value.content;
        if (!translated) {
          a.value.adapted = a.value.translated = ma.value.content;
        }
      }
      return newQ;
    });
    return mergedQs;
  }

  mergeDoc(langId, master, translated) {
    if (!translated) {
      let { id, ...newDoc } = {
        ...master,
        langId,
        questions: this.mergeQuestions(master, translated),
      };
      return newDoc;
    }

    return {
      ...translated,
      sortOrder: master.sortOrder,
      questions: this.mergeQuestions(master, translated),
    };
  }

  documentIsReferencedInModule(m, key) {
    const docs = m[this.docTypeProperty];
    return docs && docs.some((k) => k === key);
  }

  documentIsReferenced(mods, key) {
    return mods.some((m) => this.documentIsReferencedInModule(m, key));
  }

  list(langId, role, findAll) {
    return this.find(undefined, langId, role, findAll);
  }

  find(key, langId, role, findAll) {
    const masters = this.getDocs("", key);
    if (!langId) {
      return masters;
    }

    const translated = this.getDocs(langId, key);
    const langModules = findAll
      ? Promise.resolve([2])
      : listModules(langId, role);

    return Promise.all([masters, translated, langModules]).then((r) => {
      const [ms, ts, langModules] = r;

      const existingDocs = new Map(ts.map((t) => [t.key, t]));

      const mergedDocs = ms.map((m) =>
        this.mergeDoc(langId, m, existingDocs.get(m.key))
      );

      return findAll
        ? mergedDocs
        : mergedDocs.filter((doc) =>
            this.documentIsReferenced(langModules, doc.key)
          );
    });
  }

  update(user, doc) {
    console.log("Update doc", doc);
    return dbClient.upsertDoc(this.docTypePlural, stampDoc(doc, user));
  }

  insert(user, doc) {
    console.log("Insert doc", doc);
    return dbClient
      .upsertDoc(this.docTypePlural, stampDoc(doc, user))
      .then((doc) => {
        return doc;
      });
  }

  remove(key) {
    return dbClient
      .queryDocs(this.docTypePlural, {
        query: "c.key = @key",
        parameters: [{ name: "@key", value: key }],
        projection: "c.id",
      })
      .then((ids) => {
        const deletes = ids.map((row) => {
          console.log("Del doc", row.id);
          return dbClient.deleteDoc(row.id);
        });

        return Promise.all(deletes);
      });
  }
}
