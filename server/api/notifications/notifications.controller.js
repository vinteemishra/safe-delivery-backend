'use strict';

import { list, update, insert, remove, find } from './notifications.model';

export const index = async (ctx, next) => {
  const langId = ctx.query.langId;
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
  let data = await find(ctx.params.notificationKey, ctx.query.langId);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const del = async (ctx, next) => {
  let data = await remove(ctx.params.notificationKey);
  ctx.status = 200;
  ctx.body = {ok: true};
  await next();
};
