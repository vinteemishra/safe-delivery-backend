'use strict';

import * as model from "./onboarding.model";

export const index = async (ctx, next) => {
  const langId = ctx.query.langId;
  const data = await model.list(langId);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const put = async (ctx, next) => {
  const data = await model.update(ctx.userId, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const post = async (ctx, next) => {
  const data = await model.insert(ctx.userId, ctx.request.body);
  console.log("body: ", ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const get = async (ctx, next) => {
  const key = ctx.params.onbKey;
  const langId = ctx.query.langId;
  const data = await model.find(langId, key);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const del = async (ctx, next) => {
  const data = await model.remove(ctx.params.onbKey);
  ctx.status = 200;
  ctx.body = { ok: true };
  await next();
};
