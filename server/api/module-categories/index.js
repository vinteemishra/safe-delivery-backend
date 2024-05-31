"use strict";

import {
  list,
  del,
  post,
  patch,
  publish,
  getPublishVersion,
} from "./module-categories.controller";
import router from "koa-router";

const modulesCategories = router();

modulesCategories.get("/", list);
modulesCategories.patch("/", patch);
modulesCategories.post("/", post);
modulesCategories.delete("/:moduleCategoryKey", del);
modulesCategories.post("/publish", publish);
modulesCategories.get("/publish/version", getPublishVersion);

export default modulesCategories;
