'use strict';

import { casesModel } from './cases.model';
export const index = async (ctx, next) => {
  const langId = ctx.query.langId;
  const showAll = true; //ctx.query.showAll === 'true';
  let data = await casesModel.list(langId, ctx.role, showAll);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const put = async (ctx, next) => {
  let data = await casesModel.update(ctx.userId, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const post = async (ctx, next) => {
  let data = await casesModel.insert(ctx.userId, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const get = async (ctx, next) => {
  let data = await casesModel.find(ctx.params.caseKey, ctx.query.langId, ctx.role, true);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const del = async (ctx, next) => {
  let data = await casesModel.remove(ctx.params.caseKey);
  ctx.status = 200;
  ctx.body = { ok: true };
  await next();
};
