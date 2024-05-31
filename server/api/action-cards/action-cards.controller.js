'use strict';

import { actionCardsModel } from './action-cards.model';

export const index = async (ctx, next) => {
  const langId = ctx.query.langId;
  const showAll = ctx.query.showAll === 'true';
  let data = await actionCardsModel.list(langId, ctx.role, ctx.role === 'admin' && showAll);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const put = async (ctx, next) => {
  let data = await actionCardsModel.update(ctx.userId, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const post = async (ctx, next) => {
  let data = await actionCardsModel.insert(ctx.userId, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const get = async (ctx, next) => {
  let data = await actionCardsModel.find(ctx.params.cardKey, ctx.query.langId, ctx.role, ctx.role === 'admin');
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const del = async (ctx, next) => {
  let data = await actionCardsModel.remove(ctx.params.cardKey);
  ctx.status = 200;
  ctx.body = {ok: true};
  await next();
};
