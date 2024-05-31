'use strict';

import { proceduresModel } from './procedures.model';

export const index = async (ctx, next) => {
  const langId = ctx.query.langId;
  const showAll = ctx.query.showAll === 'true';
  let data = await proceduresModel.list(langId, ctx.role, ctx.role === 'admin' && showAll);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const put = async (ctx, next) => {
  let data = await proceduresModel.update(ctx.userId, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const post = async (ctx, next) => {
  let data = await proceduresModel.insert(ctx.userId, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const get = async (ctx, next) => {
  let data = await proceduresModel.find(ctx.params.procedureKey, ctx.query.langId, ctx.role, ctx.role === 'admin');
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const del = async (ctx, next) => {
  let data = await proceduresModel.remove(ctx.params.procedureKey);
  ctx.status = 200;
  ctx.body = {ok: true};
  await next();
};
