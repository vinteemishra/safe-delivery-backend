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
  publiss1,
  publiss2,
} from "../../lib/publisher";
const fs = require('fs');


export const list = async (ctx, next) => {
  var id = ctx.query.key;
  const data = await getModuleCategories(id);
  ctx.status = 200;
  ctx.body = data;
  await next();
};


// export const list = async (ctx, next) => {
//   var id = ctx.query.key;
//   const data = await getModuleCategories(id);

//   const cleanedData = data.map((doc) => {
//     if (doc.modules) {
//       doc.modules = doc.modules.map((module) => {
//         let cleanedModule = module.replace(/_\d+$/, "");
//         cleanedModule = cleanedModule.replace(/[_-]/g, ' ');
//         cleanedModule = cleanedModule.toLowerCase().replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
//         return cleanedModule;
//       });
//     }
//     return doc;
//   });

//   ctx.status = 200;
//   ctx.body = cleanedData;
//   await next();
// };


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




export const ModulesByCategory = async (ctx, next) => {
  ctx.req.setTimeout(0);
  try {
    // const categoryId = ctx.params.id; 
    const { id: categoryId, langId } = ctx.params;

    const draft = ctx.query.draft === 'true'; 
    const fileName = await publiss(categoryId,langId); 

    ctx.set('Content-disposition', `attachment; filename=${fileName}`);
    ctx.set('Content-type', 'application/json');
    ctx.body = fs.createReadStream(fileName);
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
  await next();
};


export const ZipByCategory = async (ctx, next) => {
  ctx.req.setTimeout(0);
  try {
    // const categoryId = ctx.params.id; 
    const { id: categoryId, langId } = ctx.params;

    const draft = ctx.query.draft === 'true'; 
    const fileName = await publiss1(categoryId,langId); 

    ctx.set('Content-disposition', `attachment; filename=${fileName}`);
    ctx.set('Content-type', 'application/zip');
    ctx.body = fs.createReadStream(fileName);
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
  await next();
};


export const ZipvideosByCategory = async (ctx, next) => {
  ctx.req.setTimeout(0);
  try {
    // const categoryId = ctx.params.id; 
    
    const { id: categoryId, langId } = ctx.params;


    const draft = ctx.query.draft === 'true'; 
    const fileName = await publiss2(categoryId,langId); 

    ctx.set('Content-disposition', `attachment; filename=${fileName}`);
    ctx.set('Content-type', 'application/zip');
    ctx.body = fs.createReadStream(fileName);
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
  await next();
};

  






  
