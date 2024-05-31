'use strict';


export const index = async (ctx, next) => {

  // The auth model is used by middleware so no need to call again, just fetch from context
  let data =  {
    userId: ctx.userId,
    role: ctx.role,
    languages: ctx.languages
  };
  ctx.status = 200;
  ctx.body = data;

  await next();
};

