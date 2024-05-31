'use strict';

import { index, del, put, get, post } from './notifications.controller';
import router from 'koa-router';

const notifications = router();

notifications.get('/', index);
notifications.put('/', put);
notifications.get('/:notificationKey', get);
notifications.post('/', post);
notifications.delete('/:notificationKey', del);

export default notifications;
