'use strict';

import { imagesIndex, videosIndex } from './assets.controller';
import router from 'koa-router';

const assets = router();
assets.get('/images', imagesIndex);
assets.get('/videos', videosIndex);

export default assets;
