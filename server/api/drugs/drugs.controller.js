'use strict';

import { list, update, insert, remove, find } from './drugs.model';

export const index = async (ctx, next) => {
  const langId = ctx.query.langId;
  const showAll = ctx.query.showAll === 'true';
  let data = await list(langId, showAll);
  console.log("List drugs - got this many:", data.length);
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
  let data = await find(ctx.params.drugKey, ctx.query.langId, true);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const del = async (ctx, next) => {
  let data = await remove(ctx.params.drugKey);
  ctx.status = 200;
  ctx.body = { ok: true };
  await next();
};
