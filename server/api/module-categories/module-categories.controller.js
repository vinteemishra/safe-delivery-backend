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
//   const data = await getModuleCategories(id);
  
//   // Process each category object
//   data.forEach(category => {
//     // Clean up module names
//     category.modules = category.modules.map(module => cleanModuleName(module));
//   });

//   ctx.status = 200;
//   ctx.body = data;
//   await next();
// };

// // Function to clean module names
// function cleanModuleName(moduleName) {
//   // Split by underscore and take the first part
//   const cleanName = moduleName.split('_')[0];
//   // Replace hyphens with spaces
//   const normalized = cleanName.replace(/-/g, ' ');
//   // Capitalize the first letter of each word
//   return normalized.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
// }







// export const list = async (ctx, next) => {
//   var id = ctx.query.key;
//   const data = await getModuleCategories(id);
  
//   // Modify the response data to extract only module names without suffixes
//   const modifiedData = data.map(category => ({
//     ...category,
//     modules: category.modules.map(module => {
//       return module.split('_')[0].replace(/-/g, ' '); // Replace hyphens with spaces
//     })
//   }));

//   ctx.status = 200;
//   ctx.body = modifiedData;
//   await next();
// };


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


// export const list = async (ctx, next) => {
//   var id = ctx.query.key;
  //   const data = await getModuleCategories(id);
//   const cleanedData = data.map((doc) => {
//     let cleanedDoc = { ...doc }; // Create a shallow copy of the document
//     if (cleanedDoc.modules) {
//       cleanedDoc.modules = cleanedDoc.modules.map((module) => {
//         let cleanedModule = module.replace(/_\d+$/, "");
//         cleanedModule = cleanedModule.replace(/[_-]/g, ' ');
//         cleanedModule = cleanedModule.toLowerCase().replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
//         return cleanedModule;
//       });
//     }
//     return cleanedDoc;
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
    
    const { id: categoryId, langId } = ctx.params;


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

  






  
