'use strict';

import { index,  put } from './about.controller';
import router from 'koa-router';

const about = router();

about.get('/:section', index);
about.put('/:section', put);

export default about;
