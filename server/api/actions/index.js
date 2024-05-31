"use strict";

import { index } from "./actions-controller";
import router from "koa-router";

const actions = router();

actions.get("/", index);

export default actions;
