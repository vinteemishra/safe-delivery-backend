"use strict";
require("source-map-support").install();
import config from "./index";
import log from "./logging";
import morgan from "koa-morgan";
import parser from "koa-bodyparser";
import compress from "koa-compress";
import cors from "@koa/cors";
import qs from "koa-qs";
import send from "koa-send";
import convert from "koa-convert";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { getUser } from "../api/auth/auth.model";
import { actionsdbclient } from "../lib/actionsdb";

const bypassAuth = false;

async function setHardcodedAuthInfo(ctx, next) {
    ctx.userId = "jeppe@somewhere";
    ctx.role = "admin";
    // ctx.role = 'translator';
    // ctx.languages = ['ee722f96-fcf6-4bcf-9f4e-c5fd285eaac3', '22118d52-0d78-431d-b1ba-545ee63017ca'];
    await next();
}

// Get role etc onto the context
async function setAuthInfo(ctx, next) {
    const azureId = ctx.headers["x-ms-client-principal-name"];

    if (azureId) {
        const userData = await getUser(azureId);

        log.info(`auth info for ${azureId}`, userData);

        if (userData) {
            ctx.userId = userData.userId;
            ctx.role = userData.role;
            ctx.languages = userData.languages || [];
            await next();
        } else {
            ctx.status = 200;
            ctx.body = `The Azure user with id ${azureId} is not defined in the CMS. Please contact Maternity Foundation.`;
        }
    } else {
        await next();
    }
}

const isPublicUrl = (url) => ["/api/public", "/api/apks/latest"].reduce(
    (acc, curr) => acc || url.startsWith(curr),
    false
);

// Need auth unless we're in /public
const requireAuth = async(ctx, next) =>
    !(isPublicUrl(ctx.request.url) || ctx.userId) ?
    ctx.redirect("https://sda.maternity.dk/.auth/login/aad") :
    await next();

// If not an admin, langId needs to match
async function matchLangId(ctx, next) {
    if (ctx.role !== "admin") {
        if (ctx.query.langId === "") {
            ctx.throw(403, "only admins can edit master");
        }
        if (ctx.query.langId && !isPublicUrl(ctx.request.url)) {
            const ls = ctx.languages || [];
            if (!ls.includes(ctx.query.langId)) {
                ctx.status = 403;
                return;
            }
        }
    }
    await next();
}

async function serveIndex(ctx, next) {
    // Api is served separately
    if (ctx.url.startsWith("/api")) {
        await next();
        return;
    }

    // Dev is served from using webpack
    if (config.env === "dev") {
        console.log("dev - serving index");
        const staticRoot = path.join(__dirname, "../../client/public/");
        const absolutePath = path.join(staticRoot, ctx.path);
        const relativePath = path.join("client/public/", ctx.path);

        // Send files in /public/
        const fs = require("fs");
        if (fs.existsSync(absolutePath)) {
            await send(ctx, relativePath);
            return;
        }

        ctx.body = ctx.webpack.fileSystem
            .readFileSync(path.join(__dirname, "../../dist/index.html"))
            .toString();
        return;
    }

    // Production is serving through dist
    try {
        // For root we help it along to index
        if (ctx.path === "/") {
            ctx.path = "index.html";
        }

        // First try the path
        await send(ctx, ctx.path, {
            root: path.join(__dirname, "..", "..", "dist"),
        });
    } catch (e) {
        // Or else just serve the index
        await send(ctx, "/index.html", {
            root: path.join(__dirname, "..", "..", "dist"),
        });
    }
}

export default function configKoa(app) {
    // Better handling of non-Error errors
    app.use(async(ctx, next) => {
        try {
            await next();
        } catch (error) {
            if (!(error instanceof Error))
                error = new Error(`non-error thrown: ${JSON.stringify(error)}`);

            throw error;
        }
    });

    app.use(
        parser({
            strict: false,
            jsonLimit: "10mb",
        })
    );

    if (config.env !== "dev" && !bypassAuth) {
        app.use(setAuthInfo);
        app.use(requireAuth);
        app.use(matchLangId);
    } else {
        app.use(setHardcodedAuthInfo);
        app.use(matchLangId);
    }

    app.use(async(ctx, next) => {
        if (ctx.method === "POST") {
            console.log("CTX here1: ", Object.assign({}, ctx.request.body));
            const ctype = ctx.headers["content-type"];
            const clength = ctx.headers["content-length"];
            const cenc = ctx.headers["content-encoding"];
            log.info(
                `Req ${ctx.url}, Content Type: ${ctype}, Length ${clength}, Encoding ${cenc}`
            );
            actionsdbclient.createItem({
                id: uuidv4(),
                url: ctx.request.url,
                queryString: ctx.query && Object.keys(ctx.query).length > 0 ?
                    ctx.query :
                    undefined,
                body: Object.assign({}, ctx.request.body),
                pathParams: ctx.params && Object.keys(ctx.params).length > 0 ?
                    ctx.params :
                    undefined,
                response: ctx.response,
                method: ctx.method,
            });
        }
        await next();
    });

    qs(app, "first");
    app.use(cors({}));
    app.use(compress());

    app.on("error", (err) => log.info("caught error", JSON.stringify(err), err));

    app.use(
        morgan(config.logType, {
            stream: {
                write: (message) => log.info(message.trim()),
            },
        })
    );

    if (config.env === "dev") {
        const webpackConfig = require("../../webpack.config.js");
        var webpack = require("webpack");
        const compiler = webpack(webpackConfig);
        const webpackDevMiddleware = require("koa-webpack-dev-middleware");
        const mw = require("webpack-dev-middleware");
        const middleware = webpackDevMiddleware(compiler, {
            noInfo: true,
            publicPath: webpackConfig.output.publicPath,
            silent: false,
            stats: { color: true },
        });

        app.use(convert(middleware));
        app.use(convert(require("koa-webpack-hot-middleware")(compiler)));
    }

    app.use(serveIndex);

    app.use(async(ctx, next) => {
        await next();
        if (ctx.request.method !== "GET") {
            actionsdbclient.createItem({
                id: uuidv4(),
                url: ctx.request.url,
                queryStringParams: ctx.query && Object.keys(ctx.query).length > 0 ?
                    ctx.query :
                    undefined,
                body: ctx.request.body && Object.keys(ctx.request.body).length > 0 ?
                    ctx.request.body :
                    undefined,
                pathParams: ctx.params && Object.keys(ctx.request.body).length > 0 ?
                    ctx.request.body :
                    undefined,
                response: ctx.response,
                method: ctx.method,
            });
        }
    });
}