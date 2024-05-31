import { findProfileByEmail } from "../pub/profile.model";

export const index = async (ctx, next) => {
  const { email } = ctx.request.query;
  await findProfileByEmail(email)
    .then((profile) => {
      if (profile && profile.profile) {
        ctx.status = 200;
        ctx.body = { profile };
      } else {
        ctx.status = 404;
        ctx.body = { error: "Not Found" };
      }
    })
    .catch((error) => {
      console.log(error);
      ctx.status = 500;
      ctx.body = { error };
    });
  await next();
};