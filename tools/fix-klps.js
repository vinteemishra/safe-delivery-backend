'use strict';
require('babel-register');
require('babel-polyfill');

// const dbClient = require('../server/lib/documentdb').dbClient;
import {dbClient} from '../server/lib/documentdb';

let count = 0;

dbClient.queryDocs('key-learning-points', {
    query: "is_defined(c.questions[0].answers[0].result)"
}).then(docs => {
    docs.forEach(doc => {
        for (let q of doc.questions) {
            for(let a of q.answers) {
                delete a.result;
            }
        }
        console.log("Fixing:", doc.key);
        dbClient.upsertDoc('key-learning-points', doc).then(r => {
            console.log("Fixed:", ++count);
        });
    });
});