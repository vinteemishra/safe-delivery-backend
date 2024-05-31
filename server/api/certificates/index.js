"use strict";

import { index, del, put, get, post } from "./certificates.controller";
import router from "koa-router";

const certificates = router();

certificates.get("/", index);
certificates.put("/", put);
certificates.get("/:certKey", get);
certificates.post("/", post);
certificates.delete("/:certKey", del);

export default certificates;
