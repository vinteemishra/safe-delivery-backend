'use strict';

import { stampDoc, dbClient } from '../../lib/documentdb';
import { saveMapping } from '../../lib/datacollection';
import { update as updateScreen, remove as removeScreen } from '../screens/screens.model';
import { videoScreenKey } from '../assets/assets.model';

const MODULES = 'modules';


const sortOrder = [
  "COVID-19",
  "Infection Prevention",
  "Safe Abortion",
  "Post Abortion Care",
  "Hypertension",
  "Normal Labour and Birth",
  "Active Management of Third Stage Labour",
  "Prolonged Labour",
  "Post Partum Hemorrhage",
  "Manual Removal of Placenta",
  "Maternal Sepsis",
  "Neonatal Resuscitation",
  "Newborn Management",
  "Care of The Sick Newborn",
  "Low Birth Weight",
  "Female Genital Mutilation",
];

const sortModules = (modules) => {
  (modules || []).sort((d1, d2) => sortOrder.indexOf(d1.description || "") - sortOrder.indexOf(d2.description || ""));
  return modules;
}


// Add any missing properties to module m
function augmentModule(m) {
  return { ...{ actionCards: [], procedures: [], videos: [], drugs: [], keyLearningPoints: [] }, ...m }
}

function getModules(langId, moduleKey) {
  let query = "c.langId = @langId";
  let params = [
    { name: "@langId", value: langId }
  ];
  if (moduleKey) {
    params.push({ name: "@moduleKey", value: moduleKey });
    query += ' AND c.key = @moduleKey';
  }

  return dbClient.queryDocs(MODULES, {
    query: query,
    parameters: params
  }).then(ms => { return ms.map(m => augmentModule(m)) })
}

export const mergeModule = (langId, master, translated) => {
  if (!translated) {
    let { id, ...module } = { ...master, langId: langId };
    return module;
  }

  let module = { ...translated };

  return module;
};

export function list(langId, role) {
  return find(undefined, langId, role);
}

function fieldEmpty(o, field) {
  return !o.hasOwnProperty(field) || o[field].length == 0;
}

export function moduleIsEmpty(m) {
  return ['actionCards', 'procedures', 'videos', 'drugs'].reduce((acc, field) => acc && fieldEmpty(m, field), true);
}

export function findWithKey(moduleKey) {
  const query = "c.key = @moduleKey";
  const params = [
    { name: "@moduleKey", value: moduleKey }
  ];

  return dbClient.queryDocs(MODULES, {
    query: query,
    parameters: params
  }).then(ms => { return ms.map(m => augmentModule(m)) })
}


export async function find(moduleKey, langId, role) {
  const data = await findUnsorted(moduleKey, langId, role);
  return sortModules(data);
}

function findUnsorted(moduleKey, langId, role) {
  const masters = getModules('', moduleKey);
  if (!langId) {
    return masters;
  }

  const translated = getModules(langId, moduleKey);

  return Promise.all([masters, translated]).then(r => {
    const [ms, ts] = r;

    const existingModules = new Map(ts.map(t => [t.key, t]));
    const mergedModules = ms.map(m => mergeModule(langId, m, existingModules.get(m.key)));
    return mergedModules.filter(m => role === 'admin' || !moduleIsEmpty(m));
  });
}

export function screenKey(moduleKey) {
  return `module:${moduleKey}`;
}

export async function update(user, module) {
  // Updating non-master module with videos: should sync "video:*" screens with selected videos
  console.log("module:", JSON.stringify(module, null, 2));
  const shouldUpdate = module.langId !== '';
  if (!shouldUpdate) {
    console.log("should not update...");
    return {};
  }

  const oldModuleData = module.id ? await dbClient.readDoc(module.id) : undefined;
  const oldVideoList = oldModuleData ? oldModuleData.resource.videos : [];
  const newVideoList = module.videos;

  // Delete screen texts which is in the old list, but not the list we just got from the frontend
  const toDelete = oldVideoList.filter(oldkey => newVideoList.indexOf(oldkey) === -1);
  const deletePromises = toDelete.map(videoKey => removeScreen(videoScreenKey(videoKey), module.langId));
  await Promise.all(deletePromises);

  // We look through the existing screen texts to see which videos needs to be added.
  const existingScreenTexts = await dbClient.queryDocs("screens", { query: `c.langId = "${module.langId}"` });
  const toAdd = newVideoList.filter(key => existingScreenTexts.find(e => e.key === videoScreenKey(key)) === undefined);
  const addPromises = toAdd.map(videoKey => updateScreen(user, [{ key: videoScreenKey(videoKey), content: videoKey, adapted: videoKey, translated: videoKey, langId: module.langId }]))
  await Promise.all(addPromises);

  return dbClient.upsertDoc(MODULES, stampDoc(module, user));
}

export function insert(user, m) {
  const module = { actionCards: [], procedures: [], ...m };

  console.log("Insert module", module);
  return dbClient.upsertDoc(MODULES, stampDoc(module, user)).then(clean => {
    // Add master screen for translating name of module
    // No need for any Action Card screen names as no action cards are created yet
    if (module.langId === '') {
      return updateScreen(user, [{ key: screenKey(module.key), content: module.description, langId: '' }]).then(() => {
        return clean;
      });
    } else {
      return clean;
    }
  })
    .then(clean => {
      return saveMapping('module', clean.key, clean.description).then(() => clean);
    });
}

export function remove(moduleKey) {
  return dbClient.queryDocs(MODULES, {
    query: "c.key = @key",
    parameters: [{ name: "@key", value: moduleKey }],
    projection: 'c.id'
  }).then(ids => {
    const deletes = ids.map(row => {
      console.log("Del module", row.id);
      return dbClient.deleteDoc(row.id);
    });

    return Promise.all([...deletes, removeScreen(screenKey(moduleKey))]);
  });
}
