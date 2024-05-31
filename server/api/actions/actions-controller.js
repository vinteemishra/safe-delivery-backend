"use strict";

import { actionsdbclient } from "./../../lib/actionsdb";

export const index = async (ctx, next) => {
  const { pageNumber } = ctx.query;
  const { perPage } = ctx.query;
  let data = await actionsdbclient.getItems(pageNumber, perPage);
  ctx.status = 200;
  ctx.body = data;
  await next();
};
