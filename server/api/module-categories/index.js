"use strict";

import {
  list,
  del,
  post,
  patch,
  publish,
  getPublishVersion,
  ModulesByCategory,
  
} from "./module-categories.controller";
import router from "koa-router";

const modulesCategories = router();


modulesCategories.get("/", list);
modulesCategories.patch("/", patch);
modulesCategories.post("/", post);
modulesCategories.delete("/:moduleCategoryKey", del);
modulesCategories.post("/publish", publish);
modulesCategories.get("/publish/version", getPublishVersion);
modulesCategories.get("/category_wise_data/:id",ModulesByCategory);


export default modulesCategories;
