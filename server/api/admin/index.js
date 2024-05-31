'use strict';

import router from 'koa-router';
import * as ShareCertificateModel from "../pub/shareCert.model";

export const lookupCertId = async (ctx, next) => {
    const appId = ctx.params.certId;
    if (appId === undefined || appId.trim() === "") {
        ctx.status = 400;
        ctx.body = { error: "Missing params" };
        await next()
        return;
    }

    try {
        ctx.body = await ShareCertificateModel.getCertByUniqueId(appId);
    } catch (e) {
        ctx.status = 404;
        ctx.body = { error: "Not found" };
        await next()
        return;
    }
    await next();
};


const admin = router();
admin.get('/certsById/:certId', lookupCertId);

export default admin;