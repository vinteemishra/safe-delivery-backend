'use strict';

import {test} from 'babel-tap';
import {mergeModule} from '../api/modules/modules.model'

const cards = [{id: 'i1', content: 'c1'},{id: 'i2', content: 'c2'}, {id: 'i3', content: 'c3'}, {id: 'i4', content: 'c4'}];
const [c1,c2,c3,c4] = cards;

const actionCards = [{key: 'k1', description: 'd1', cards: [c1,c2]}, {key: 'k2', description: 'd2', cards: [c4]}, {key: 'k3', description: 'd3', cards: [c4]}];
const [a1,a2,a3] = actionCards;

const master = {langId:'', id: 'mid', key: 'key', description: 'desc', actionCards: [a1,a2]};

const translatedCards = [{id: 'i1', content: 'c_11', adapted: 'a1', translated: 't1'},{id: 'i2', content: 'c_21', adapted: 'a2', translated: 't2'}, {id: 'i3', content: 'c_31', adapted: 'a3', translated: 't3'}]
const [t1,t2,t3] = translatedCards;
const translated = {...master, id: 'tid', langId: 'lid'};

test('mergeModule should return', root => {
  test('module with no id when t is undefined', t => {
    t.plan(1);
    const actual = mergeModule('lid', master, undefined);
    t.match(actual,{...master, langId:'lid', id: null});
  });


  test('unchanged module id when t is defined', t => {
    t.plan(1);
    t.match(mergeModule('lid', master, translated), translated);
  });



  root.end();
});
