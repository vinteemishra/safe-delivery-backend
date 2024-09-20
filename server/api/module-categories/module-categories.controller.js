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
  // console.log("Original Data:", JSON.stringify(data, null, 2));

  ctx.status = 200;
  ctx.body = data;
  await next();
};


// export const list = async (ctx, next) => {
//   var id = ctx.query.key;

  
//   function generateModuleDescription(moduleKey) {
//     if (typeof moduleKey !== 'string') {
//       return 'Unknown Module';
//     }

//     const moduleName = moduleKey.split('_')[0]; 
//     return moduleName
//       .split('-')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//       .join(' ');
//   }

  
//   const data = await getModuleCategories(id);

  
//   data.forEach(category => {
    
//     if (Array.isArray(category.modules)) {
  
//       category.moduleDescriptions = category.modules.reduce((acc, moduleKey) => {
//         acc[moduleKey] = generateModuleDescription(moduleKey);
//         return acc;
//       }, {});
//     } else {
      
//       category.modules = [];
//       category.moduleDescriptions = {};
//     }
//   });

  

//   ctx.status = 200;
//   ctx.body = data;
//   await next();
// };


// export const list = async (ctx, next) => {
//   var id = ctx.query.key;

  
//   function generateModuleDescription(moduleKey) {
//     const moduleName = moduleKey.split('_')[0]; // Extract module name
//     return moduleName
//       .split('-')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//       .join(' ');
//   }

  
//   const data = await getModuleCategories(id);

  
//   data.forEach(category => {
    
//     if (Array.isArray(category.modules)) {
//       category.modules = category.modules.map(moduleKey => ({
//         key: moduleKey,
//         description: generateModuleDescription(moduleKey),
//       }));
//     } else {
      
//       category.modules = [];
//     }
//   });

  

//   ctx.status = 200;
//   ctx.body = data;
//   await next();
// };



// export const list = async (ctx, next) => {
//   var id = ctx.query.key;
//   const data = await getModuleCategories(id);

  
//   const cleanedData = data.map(category => {
//     const { modules } = category;
//     let moduleName = [];

//     if (modules && modules.length > 0) {
//       moduleName = modules.map(module => {
        
//         let cleanedModule = module.replace(/_\d+$/, "");
        
//         cleanedModule = cleanedModule.replace(/[-_]/g, ' ');
        
//         cleanedModule = cleanedModule.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase());
//         return cleanedModule;
//       });
//     }

//     return {
//       ...category,
//       ModuleName: moduleName
//     };
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


// export const ZipByCategory = async (ctx, next) => {
//   ctx.req.setTimeout(0);
//   try {
//     // const categoryId = ctx.params.id; 
//     const { id: categoryId, langId } = ctx.params;

//     const draft = ctx.query.draft === 'true'; 
//     const fileName = await publiss1(categoryId,langId); 
//     console.log("vv"+fileName);

//     ctx.set('Content-disposition', `attachment; filename=${fileName}`);
//     ctx.set('Content-type', 'application/zip');
//     ctx.body = fs.createReadStream(fileName);
//   } catch (error) {
//     console.error(error);
//     ctx.status = 500;
//     ctx.body = { error: 'Internal Server Error' };
//   }
//   await next();
// };
import path from 'path';



// Exported function to handle HTTP request for downloading the zip file
export const ZipByCategory = async (ctx, next) => {
  ctx.req.setTimeout(0); // Set request timeout
  try {
    const { id: categoryId, langId } = ctx.params;
    const draft = ctx.query.draft === 'true'; // Check if draft mode is requested

    // Call main function to generate zip file
    const fileName = await publiss1(categoryId, langId);

    // Check if the generated zip file exists
    if (!fs.existsSync(fileName)) {
      ctx.status = 404;
      ctx.body = { error: 'Zip file not found' };
      return;
    }

    // Set headers for HTTP response
    ctx.set('Content-disposition', `attachment; filename=${path.basename(fileName)}`);
    ctx.set('Content-type', 'application/zip');

    // Stream the zip file as response body
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
    
    const { id: categoryId, langId} = ctx.params;


    const draft = ctx.query.draft === 'true'; 
    const fileName = await publiss2(categoryId,langId); 
    if (!fs.existsSync(fileName)) {
      ctx.status = 404;
      ctx.body = { error: 'Zip file not found' };
      return;
    }

    ctx.set('Content-disposition', `attachment; filename=${path.basename(fileName)}`);
    ctx.set('Content-type', 'application/zip');


    // ctx.set('Content-disposition', `attachment; filename=${fileName}`);
    // ctx.set('Content-type', 'application/zip');
    ctx.body = fs.createReadStream(fileName);
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
  await next();
};

  






  
