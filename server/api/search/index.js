"use strict";

import { index } from "./search.controller";
import router from "koa-router";

const search = router();

search.get("/", index);

export default search;
