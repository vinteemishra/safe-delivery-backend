'use strict';

import {update as modulesUpdate, findWithKey as modulesFindWithKey} from '../modules/modules.model';
import { QuestionsModel } from '../../lib/questionsmodel';

class KLPModel extends QuestionsModel {

  // Add the new KLP to all language modules it belongs to
  async updateModulesWithKLP(user, klp) {
    return modulesFindWithKey(klp.module).then(ms => {
      console.log("modules with key", klp.module, ms.length);
      return Promise.all(ms.map(m => {
        const index = m.keyLearningPoints.findIndex(moduleKLP => moduleKLP === klp.key);
        if (index < 0) {
          m.keyLearningPoints.push(klp.key);
          return modulesUpdate(user, m).then(m => console.log("module updated",m.id)).catch(err => console.log("err",err))
        } else {
          console.log("Not updating", m);
          return Promise.resolve({})
        }
      }))
    })
  }

  async insert(user, doc) {
    return super.insert(user, doc).then(doc => {
      return this.updateModulesWithKLP(user, doc).then(() => {
        console.log("done doc", doc)
        return doc
      });
    });
  }
}

export const keyLearningPointsModel = new KLPModel('key-learning-point', 'keyLearningPoints');
