import { dbClient, stampDoc } from "../../lib/documentdb";
import { saveMapping } from "../../lib/datacollection";

const MODULE_CATEGORIES = "module-categories";

export function getModuleCategories(id) {
  let query = "";
  let params = [];
  if (id) {
    params.push({ name: "@key", value: id });
    query += "c.key = @key";
  }

  return dbClient.queryDocs(MODULE_CATEGORIES, {
    query: query,
    parameters: params,
  });
}

export function insert(user, moduleCategory) {
  console.debug("Insert moduleCategory", moduleCategory);
  return dbClient
    .upsertDoc(MODULE_CATEGORIES, stampDoc(moduleCategory, user))
    .then((clean) =>
      saveMapping("moduleCategory", clean.key, clean.description).then(
        () => clean
      )
    );
}

// export function remove(id) {
//   return getModuleCategories(id).then((ids) => {
//     const deletes = ids.map((row) => {
//       return dbClient.deleteDoc(row.id);
//     });

//     return Promise.all([...deletes]);
//   });
// }


export function remove(id) {
  return dbClient.deleteDoc(id);
}




export function update(user, moduleCategory) {
  if (!moduleCategory.id) {
    return {};
  }
  return dbClient.upsertDoc(MODULE_CATEGORIES, stampDoc(moduleCategory, user));
}
