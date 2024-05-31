"use strict";

import { list, update, insert, find, remove } from "./certificates.model";
export const index = async (ctx, next) => {
  const langId = ctx.query.langId;
  // let data = await list(langId, ctx.role, ctx.role === 'admin');
  let data = await list(langId);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const put = async (ctx, next) => {
  let data = await update(ctx.userId, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const post = async (ctx, next) => {
  let data = await insert(ctx.userId, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const get = async (ctx, next) => {
  let data = await find(ctx.params.certKey, ctx.query.langId, ctx.role, true);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const del = async (ctx, next) => {
  await remove(ctx.params.certKey);
  ctx.status = 200;
  ctx.body = { ok: true };
  await next();
};
