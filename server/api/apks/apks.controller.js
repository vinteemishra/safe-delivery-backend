"use strict";

import {
  listApks,
  downloadLatestApk,
  generateApk,
  getStatus,
} from "./apks.model";

export const list = async (ctx, next) => {
  const langId = ctx.query.langId;

  let data = await listApks(langId);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const status = async (ctx, next) => {
  let data = await getStatus();
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const genApk = async (ctx, next) => {
  const langId = ctx.request.body.langId;
  const draft = ctx.request.body.draft;

  let data = await generateApk(langId, draft);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const downloadLatest = async (ctx, next) => {
  const langId = ctx.query.langId;

  const response = await downloadLatestApk(langId);

  ctx.set("content-type", response.headers["content-type"]);
  ctx.set("content-disposition", response.headers["content-disposition"]);
  ctx.set("content-length", response.headers["content-length"]);

  ctx.status = 200;
  ctx.body = response;
  await next();
};
