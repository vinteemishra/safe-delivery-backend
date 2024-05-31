'use strict';

import { list, add, remove, update } from './screens.model';

export const index = async (ctx, next) => {
  const langId = ctx.query.langId;
  const showAll = ctx.query.showAll === 'true';

  let data = await list(langId, ctx.role, showAll);
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
  let data = await add(ctx.userId, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};
