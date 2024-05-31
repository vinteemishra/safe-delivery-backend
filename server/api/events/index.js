'use strict';

import router from 'koa-router';
import config from "../../config"
import * as sql from "mssql";
// import { httpRequest } from '../../lib/httpUtil';

let db;

const connect = () => {
    return new Promise((resolve, reject) => {
        const newDb = new sql.ConnectionPool(config.sqlServer, err => {
            if (err) {
                console.error("Connection failed.", err);
                reject(err);
            } else {
                console.info("Database pool #1 connected.");
                resolve(newDb);
            }
        });
    });
};

const query = async (appId) => {
    if (db === undefined) {
        db = await connect();
    }

    const result = await db.request()
            .input("app_id", sql.VarChar, appId)
            .query("SELECT TOP 5000 sessId, eventType, eventData, eventTime, serverTime FROM dbo.Events2 WHERE AppId = @app_id ORDER BY eventtime DESC");
    return result.recordset;
};

export const lookupAppId = async (ctx, next) => {
    const appId = ctx.params.appId;
    if (appId === undefined || appId.trim() === "") {
        ctx.status = 400;
        ctx.body = { error: "Missing params" };
        await next()
        return;
    }

    try {
        ctx.body = await query(appId);
    } catch (e) {
        if (e.code !== "ELOGIN") {
            ctx.body = { error: e };
        }
    }
    await next();
};


const events = router();
// events.get('/ip', async (ctx) => {
//     var options = {
//         host: "ipinfo.io",
//         path: "/",
//     };
//     ctx.type = "application/json";
//     ctx.body = await httpRequest(options);
// });
events.get('/:appId', lookupAppId);

export default events;