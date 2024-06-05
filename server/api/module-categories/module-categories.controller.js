import {
  getModuleCategories,
  insert,
  remove,
  update,
} from "./module-categories.model";
import {
  publishModuleCategory,
  getModuleCategoryVersion,
  publiss,
} from "../../lib/publisher";
const fs = require('fs');


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


// export const ModulesByCategory= async (ctx, next) => {
//   // const lang = req.query.lang || 'ee722f96-fcf6-4bcf-9f4e-c5fd285eaac3';
//   // const draft = req.query.draft === 'true';
//   // const category_data=await publiss().catch(console.error);
//   // ctx.status = 200;
//   // ctx.body = JSON.stringify({ category_data });
//   // await next();
//   try {
//     const fileName = await publiss(); // Call the main function asynchronously

//     // Set response headers
//     ctx.set('Content-disposition', `attachment; filename=${fileName}`);
//     ctx.set('Content-type', 'application/json');

//     // Send the file as the response
//     ctx.body = fs.createReadStream(fileName);
//   } catch (error) {
//     // Handle errors
//     console.error(error);
//     ctx.status = 500;
//     ctx.body = { error: 'Internal Server Error' };
//   }
// };

export const ModulesByCategory = async (ctx, next) => {
  try {
    const categoryId = ctx.params.id; // Extract categoryId from query parameters or use default
    const draft = ctx.query.draft === 'true'; // Extract draft status from query parameters
    

    const fileName = await publiss(categoryId); // Call the publiss function with categoryId and draft

    // Set response headers
    ctx.set('Content-disposition', `attachment; filename=${fileName}`);
    ctx.set('Content-type', 'application/json');

    // Send the file as the response
    ctx.body = fs.createReadStream(fileName);
  } catch (error) {
    // Handle errors
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
  await next();
};
  


  
