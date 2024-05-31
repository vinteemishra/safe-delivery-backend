'use strict';

import {test} from 'tap';
import fs from 'fs';
import {mergeContent} from '../lib/richdocument'
import * as RD from '../lib/richdocument.js'

const noCards = {cards:[]};
const masterCards = [{id: 'i1', content: 'c1'},{id: 'i2', content: 'c2'}, {id: 'i3', content: 'c3'}, {id: 'i4', content: 'c4'}];
const [m1,m2,m3,m4] = masterCards;
const master = {cards: [m1,m2]};

const translatedCards = [{id: 'i1', content: 'c_11', adapted: 'a1', translated: 't1'},{id: 'i2', content: 'c_21', adapted: 'a2', translated: 't2'}, {id: 'i3', content: 'c_31', adapted: 'a3', translated: 't3'}]
const [t1,t2,t3] = translatedCards;
const translated = {cards: [t1,t2]};

test('Converting richdocument to html should not crash', t => {
  t.plan(1);

  const doc = JSON.parse(fs.readFileSync(__dirname + '/data/richdoc.json'));

  const html = RD.docToHtml(doc, {images:new Set()});

  t.match(html, '<h1>overskrift')
});

test('mergeContent should return', root => {
  test('empty list when m is empty & t is empty or undefined', t => {
    t.plan(2);
    t.same(mergeContent(noCards, noCards), []);
    t.same(mergeContent(noCards, undefined), []);
  });

  test('master cards with translation field when t is empty or undefined', t => {
    t.plan(2);
    t.match(mergeContent(master, noCards), [{id: 'i1', content: 'c1', adapted: 'c1', translated: 'c1'}, {id:'i2'}]);
    t.match(mergeContent(master, undefined), [{id: 'i1', content: 'c1', adapted: 'c1', translated: 'c1'}, {id:'i2'}]);
  });

  test('empty list when master is empty', t => {
    t.plan(1);
    t.match(mergeContent(noCards, translated), []);
  });

  test('updated content when master has changed',  t => {
    t.plan(1);
    t.match(mergeContent(master, translated), [{id: 'i1', content: 'c1', adapted: 'a1', translated: 't1'}, {id:'i2'}]);
  });

  test('new empty card in front', t => {
    t.plan(1);
    t.match(mergeContent({cards:[m3,m1,m2]}, {cards:[t1,t2]}), [{id: 'i3', content: 'c3', adapted: 'c3', translated: 'c3'}, {id: 'i1', content: 'c1', adapted: 'a1', translated: 't1'}, {id:'i2'}]);
  });

  test('new empty card in back', t => {
    t.plan(1);
    t.match(mergeContent({cards:[m1,m2, m3]}, {cards:[t1,t2]}), [{id: 'i1', content: 'c1', adapted: 'a1', translated: 't1'}, {id:'i2'}, {id: 'i3', content: 'c3', adapted: 'c3', translated: 'c3'}]);
  });

  test('new empty card in middle', t => {
    t.plan(1);
    t.match(mergeContent({cards:[m1,m3,m2]}, {cards:[t1,t2]}), [{id: 'i1', content: 'c1', adapted: 'a1', translated: 't1'}, {id: 'i3', content: 'c3', adapted: 'c3', translated: 'c3'}, {id:'i2'}]);
  });

  test('first card removed', t => {
    t.plan(1);
    t.match(mergeContent({cards:[m2, m3]}, {cards:[t1,t2, t3]}), [{id: 'i2', content: 'c2', adapted: 'a2', translated: 't2'}, {id: 'i3', content: 'c3', adapted: 'a3', translated: 't3'}]);
  });

  test('middle card removed', t => {
    t.plan(1);
    t.match(mergeContent({cards:[m1, m3]}, {cards:[t1,t2, t3]}), [{id: 'i1', content: 'c1', adapted: 'a1', translated: 't1'}, {id: 'i3', content: 'c3', adapted: 'a3', translated: 't3'}]);
  });

  root.end();
});
