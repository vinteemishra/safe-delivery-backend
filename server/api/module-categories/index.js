"use strict";

import {
  list,
  del,
  post,
  patch,
  publish,
  getPublishVersion,
  ModulesByCategory,
  ZipByCategory,
  ZipvideosByCategory,
  
} from "./module-categories.controller";
import router from "koa-router";

const modulesCategories = router();


modulesCategories.get("/", list);
modulesCategories.patch("/", patch);
modulesCategories.post("/", post);
modulesCategories.delete("/:moduleCategoryKey", del);
modulesCategories.post("/publish", publish);
modulesCategories.get("/publish/version", getPublishVersion);
modulesCategories.get("/category_wise_data/:langId/:id",ModulesByCategory);
modulesCategories.get("/category-wise-image-bundle.zip/:langId/:id",ZipByCategory);
modulesCategories.get("/category-wise-video-bundle.zip/:langId/:id",ZipvideosByCategory);




export default modulesCategories;
