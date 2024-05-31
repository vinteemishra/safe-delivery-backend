'use strict';

import { index, del, put, get, post } from './drugs.controller';
import router from 'koa-router';

const drugs = router();

drugs.get('/', index);
drugs.put('/', put);
drugs.get('/:drugKey', get);
drugs.post('/', post);
drugs.delete('/:drugKey', del);

export default drugs;
