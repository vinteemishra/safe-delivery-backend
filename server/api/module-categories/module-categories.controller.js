import {
  getModuleCategories,
  insert,
  remove,
  update,
} from "./module-categories.model";
import {
  publishModuleCategory,
  getModuleCategoryVersion,
} from "../../lib/publisher";

export const list = async (ctx, next) => {
  var id = ctx.query.key;
  const data = await getModuleCategories(id);
  ctx.status = 200;
  ctx.body = data;
  await next();
};

export const post = async (ctx, next) => {
  ctx.status = 200;
  const { body, userId } = ctx.request;
  ctx.body = await insert(userId, body);
  await next();
};

export const del = async (ctx, next) => {
  await remove(ctx.params.id);
  ctx.status = 200;
  ctx.body = { ok: true };
  await next();
};

export const patch = async (ctx, next) => {
  const data = await update(ctx.user, ctx.request.body);
  if (Object.keys(data).length === 0) {
    ctx.status = 400;
    ctx.body = { error: "Please pass the module category id" };
  } else {
    ctx.status = 200;
    ctx.body = data;
  }
  await next();
};

export const publish = async (ctx, next) => {
  await publishModuleCategory(ctx.user);
  ctx.status = 200;
  ctx.body = { message: "Success" };
  await next();
};

export const getPublishVersion = async (ctx, next) => {
  const version = await getModuleCategoryVersion(ctx.user);
  ctx.status = 200;
  ctx.body = { version };
  await next();
};
