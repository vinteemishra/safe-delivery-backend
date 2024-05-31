"use strict";

import { index } from "./profile.controller";
import router from "koa-router";

const profiles = router();

profiles.get("/", index);

export default profiles;
