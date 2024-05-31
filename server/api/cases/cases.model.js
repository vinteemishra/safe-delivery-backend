"use strict";

import { QuestionsModel } from "../../lib/questionsmodel";

class CasesModel extends QuestionsModel {
  // Augment old-style certs to quizzType severalCorrectWithResult
  augmentCases(c) {
    const newCert = { ...c };
    console.log("C here: ", c);
    console.log("New cert: ", newCert);
    newCert.questions =
      c && c.questions
        ? c.questions.map((q) => ({
            ...q,
            quizzType: "severalCorrectWithResult",
            answers: q.answers.map((a) => {
              const correct = a.result
                ? a.result === "correct"
                : a.correct || false;
              const result = a.result || (correct ? "correct" : "harmful");

              return {
                value: a.value,
                correct: correct,
                result: result,
              };
            }),
          }))
        : [];

    return newCert;
  }

  mergeDoc(langId, master, translated) {
    let result = super.mergeDoc(langId, master, translated);
    // Use merged, but take a few from master:
    const masterDescription = master.description;
    return {
      ...result,
      comment: master.comment,
      image: master.image,
      masterDescription,
    };
  }

  async find(key, langId, role, findAll) {
    return super.find(key, langId, role, findAll).then((docs) => {
      return docs.map((c) => this.augmentCases(c));
    });
  }
}

export const casesModel = new CasesModel("case");
