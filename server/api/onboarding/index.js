'use strict';

import { index, del, put, get, post } from './onboarding.controller';
import router from 'koa-router';

const onboarding = router();

onboarding.get('/', index);
onboarding.put('/', put);
onboarding.get('/:onbKey', get);
onboarding.post('/', post);
onboarding.delete('/:onbKey', del);

export default onboarding;