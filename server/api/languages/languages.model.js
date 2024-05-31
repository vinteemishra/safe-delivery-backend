'use strict';

import {stampDoc, dbClient} from '../../lib/documentdb';
import { saveMapping } from '../../lib/datacollection';
import {list as modulesList, update as modulesUpdate} from '../modules/modules.model';
import { keyLearningPointsModel } from '../key-learning-points/key-learning-points.model';

const LANGUAGES = 'languages';

export function list() {
  return dbClient.queryDocs(LANGUAGES, {
    orderBy: "c.description"
  });
}

export function find(langId) {
  return dbClient.readDoc(langId).then(r => r.resource);
}

/**
 *  Add the defined KLPs to the selected module in the new language
 *
 * @memberOf Server/Languages
 */
function addDefaultKLPs(user, langId) {

  return Promise.all([keyLearningPointsModel.list(), modulesList(langId, 'admin')]).then(([klps, modules]) => {
    const klpMap = {};
    klps.forEach(klp => {
      klpMap[klp.module] = klpMap[klp.module] || [];
      klpMap[klp.module].push(klp.key);
    });

    return Promise.all(modules.map(m => {
      m.keyLearningPoints = klpMap[m.key];
      return modulesUpdate(user, m);
    }));
  });
}


/**
 * Updates or creates a language.
 * <br><br>
 *
 * When a new language is created the default KLPs are
 * automatically added.
 *
 * @see Server/Languages.addDefaultKLPs
 * @memberOf Server/Languages
 */
export function upsert(user, lang) {
  console.log("Upsert lang", lang);

  return dbClient.upsertDoc(LANGUAGES, stampDoc(lang, user))
    .then(doc => {

      console.log("Lang upserted", doc);
      return lang.id ? doc : addDefaultKLPs(user, doc.id).then(() => doc);
    })
    .then(doc => {
      console.log("Default KLPs added");
      return doc;
    })
    .then(doc => {
      return saveMapping("language", doc.id, doc.description).then(() => doc);
    });
}

export function remove(langId) {
  return dbClient.deleteDoc(langId);
}
