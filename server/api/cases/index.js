'use strict';

import { index, del, put, get, post } from './cases.controller';
import router from 'koa-router';

const cases = router();

cases.get('/', index);
cases.put('/', put);
cases.get('/:caseKey', get);
cases.post('/', post);
cases.delete('/:caseKey', del);

export default cases;
