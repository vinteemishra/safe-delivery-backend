'use strict';

import { list, update } from './about.model';

export const index = async (ctx, next) => {
  const langId = ctx.query.langId;
  const section = ctx.params.section;

  let data = await list(langId, section);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const put = async (ctx, next) => {
  const section = ctx.params.section;
  let data = await update(ctx.userId, section, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};
