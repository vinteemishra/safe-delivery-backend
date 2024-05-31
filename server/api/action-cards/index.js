'use strict';

import { index, del, put, get, post } from './action-cards.controller';
import router from 'koa-router';

const actionCards = router();

actionCards.get('/', index);
actionCards.put('/', put);
actionCards.get('/:cardKey', get);
actionCards.post('/', post);
actionCards.delete('/:cardKey', del);

export default actionCards;
