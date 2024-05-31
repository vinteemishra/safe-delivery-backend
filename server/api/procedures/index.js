'use strict';

import { index, del, put, get, post } from './procedures.controller';
import router from 'koa-router';

const procedures = router();

procedures.get('/', index);
procedures.put('/', put);
procedures.get('/:procedureKey', get);
procedures.post('/', post);
procedures.delete('/:procedureKey', del);

export default procedures;
