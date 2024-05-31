'use strict';

import { index, del, put, get, post } from './key-learnings-points.controller';
import router from 'koa-router';

const klp = router();

klp.get('/', index);
klp.put('/', put);
klp.get('/:klpKey', get);
klp.post('/', post);
klp.delete('/:klpKey', del);

export default klp;
