'use strict';

import { index } from './auth.controller';
import router from 'koa-router';

const auth = router();

auth.get('/', index);

export default auth;
