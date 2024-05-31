/**
 * This part of the API handles languages.
 * <br><br>
 *
 * It has the following API endpoints:
 *
 * <pre>
 *   GET    /api/languages/               - return all languages
 *   GET    /api/languages/:id            - return language specified by :id
 *   POST   /api/languages/               - creates or updates a language
 *   DELETE /api/languages/:id            - delete the specified language
 *   POST   /api/languages/:id/publish    - publish specified langauge
 *   POST   /api/languages/:id/unpublish  - unpublish specified langauge
 * </pre>
 *
 * @example
 * // Sample language JSON object:
 *
 * {
 *   "description": "Danish",
 *   "assetVersion": "africa",
 *   "LastUpdatedBy": "user@maternity.dk",
 *   "LastUpdated": 1505988436972,
 *   "id": "20ba11f8-e8bc-d9e2-5929-af022430a669",
 *   "lastPublished": 1505988432685,
 *   "version": 255,
 *   "draftLastPublished": 1505329708791,
 *   "draftVersion": 252,
 *   "learningPlatform": true
 * }
 *
 * @namespace Server/Languages
 */


'use strict';

import { index, post, del, publish, unpublish, get,filterModulesByCategory1 } from './languages.controller';
import router from 'koa-router';

const languages = router();

languages.get('/', index);
languages.post('/', post);
languages.get('/:id', get);
languages.delete('/:id', del);
languages.post('/:id/publish', publish);
languages.post('/:id/unpublish', unpublish);
languages.get('/:id/categorywese_data', filterModulesByCategory1);


export default languages;
