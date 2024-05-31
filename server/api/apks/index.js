"use strict";

import { list, status, genApk, downloadLatest } from "./apks.controller";
import router from "koa-router";

const apks = router();

apks.get("/list", list);
apks.get("/status", status);
apks.post("/genApk", genApk);
apks.get("/latest", downloadLatest);

export default apks;
