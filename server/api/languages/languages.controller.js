"use strict";

import { list, upsert, remove, find } from "./languages.model";
import { publisher, unpublisher } from "../../lib/publisher";
import { createBlockBlobFromText } from "../../lib/blobstorage";
// import{main} from "../../lib/publisher/publishIndex.main"


import config from "../../config";

export const index = async (ctx, next) => {
  let data = await list();
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const get = async (ctx, next) => {
  let data = await find(ctx.params.id);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const post = async (ctx, next) => {
  let data = await upsert(ctx.userId, ctx.request.body);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const del = async (ctx, next) => {
  let data = await remove(ctx.params.id);
  ctx.status = 200;
  ctx.body = { ok: true };
  await next();
};

export const publish = async (ctx, next) => {
  // Disable timeout on publish request
  ctx.req.setTimeout(0);

  if (ctx.role !== "admin" && config.env !== "dev") {
    ctx.status = 403;
  } else {
    console.log("List all languages: ");
    let langs = list();
    console.log("Langs here: ", langs);
    const langId = ctx.params.id;
    const draft = ctx.request.body.draft;

    console.log("Publish, draft", draft);

    const data = await publisher(
      langId,
      langs,
      createBlockBlobFromText(draft),
      ctx.userId,
      draft
    );

    ctx.status = 200;
    ctx.body = data;
    await next();
  }
};



export const unpublish = async (ctx, next) => {
  if (ctx.role !== "admin" && config.env !== "dev") {
    ctx.status = 403;
  } else {
    let langs = list();
    const langId = ctx.params.id;

    console.log("Unpublish", langId);

    const data = await unpublisher(
      langId,
      langs,
      createBlockBlobFromText(false),
      ctx.userId
    );

    ctx.status = 200;
    ctx.body = data;
    await next();
  }
};
