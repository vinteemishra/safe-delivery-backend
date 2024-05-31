'use strict';

import { listImages, listVideos } from './assets.model';

export const imagesIndex = async (ctx, next) => {
  let data = await listImages(ctx.query.version);
  //console.log(`image assets for  ${ctx.query.version}`, data);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const videosIndex = async (ctx, next) => {
  let data = await listVideos();
  //console.log(`video assets for  ${ctx.query.version}`, data);
  ctx.status = 200;
  ctx.body = data;
  await next();
};
