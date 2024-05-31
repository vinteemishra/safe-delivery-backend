'use strict';

import Koa from 'koa';
import config from './config';
import configRoutes from './config/routes';
import configKoa from './config/koa';
import {createTable} from './lib/tablestorage'

const app = new Koa();
app.port = config.port;

configKoa(app);
configRoutes(app);

createTable().then(() => console.log("Tables created")).catch(e => console.error("err",e));

export default app;
