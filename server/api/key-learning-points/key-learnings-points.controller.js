'use strict';

import { keyLearningPointsModel } from './key-learning-points.model';

export const index = async (ctx, next) => {
  console.log("Index from KLP is called");
  const langId = ctx.query.langId;
  const showAll = ctx.query.showAll === 'true';
  let data = await keyLearningPointsModel.list(langId, ctx.role, ctx.role === 'admin' && showAll);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const put = async (ctx, next) => {
  let data = await keyLearningPointsModel.update(ctx.userId, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const post = async (ctx, next) => {
  let data = await keyLearningPointsModel.insert(ctx.userId, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const get = async (ctx, next) => {
  // const key = ctx.params.klpKey;
  let data = await keyLearningPointsModel.find(ctx.params.klpKey, ctx.query.langId);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const del = async (ctx, next) => {
  let data = await keyLearningPointsModel.remove(ctx.params.klpKey);
  ctx.status = 200;
  ctx.body = { ok: true };
  await next();
};
