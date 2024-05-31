"use strict";

import { searchResult } from "./search.model";

export const index = async(ctx, next) => {
    const { searchString, type } = ctx.query;
    //  let { limit } = ctx.query;

    let drugs = [];
    let actionCards = [];
    let procedures = [];

    if (type === "drugs") {
        drugs = searchResult(searchString, type);
    } else if (type === "procedures") {
        procedures = searchResult(searchString, type);
    } else if (type === "action-cards") {
        actionCards = searchResult(searchString, type);
    } else {
        drugs = searchResult(searchString, "drugs");
        procedures = searchResult(searchString, "procedures");
        actionCards = searchResult(searchString, "action-cards");
    }

    let data = await Promise.all([drugs, procedures, actionCards]);

    ctx.status = 200;
    ctx.body = data[0].concat(data[1]).concat(data[2]); //data.slice(0, limit);
    await next();
};