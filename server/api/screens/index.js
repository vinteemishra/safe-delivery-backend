/**
 * This part of the API handles screen texts.
 * <br><br>
 *
 * It has the following API endpoints:
 *
 * <pre>
 *   GET    /api/screens/           - return specified screen texts
 *   PUT    /api/screens/           - update specified screen text
 * </pre>
 *
 * @example
 * // Sample JSON object:
 *
 * {
 *   "key": "yes",
 *   "content": "Yes",
 *   "adapted": "Yes",
 *   "translated": "Ja"
 * }
 *
 * @namespace Server/Screens
 */

"use strict";

import { index, put } from "./screens.controller";
import router from "koa-router";

const screens = router();

screens.get("/", index);
screens.put("/", put);

export default screens;
