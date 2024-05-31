'use strict';

import {test} from 'tap';
import tapromise from 'tapromise';
import { contentURL} from '../lib/blobstorage';

import * as pub from '../lib/publisher.js'

const [l1, l2] = [
  {
    id: "l1",
    lastPublished: 1,
    version: 1,
    description: "lang1"
  },
  {
    id: "l2",
    description: "lang2"
  },
];

const actionCard = {
  id: 'aic',
  key: 'akey',
  icon: 'aicon',
  cards: []
};

function exporter(f, json) {
  return Promise.resolve(json)
}

test('Published index should only contain published languages', root => {
  const t = tapromise(root);
  const actual = pub.publishIndex(42, [l1, l2], exporter).then(r => JSON.parse(r));

  return Promise.all([
    t.equal(actual.then(r => r.languages.length), 2),
    t.match(actual, {
      version: 42,
      languages: [
        {id: 'l1', description: 'lang1', version:1, href: contentURL(`${l1.id}/bundle.json`)}
        ]
      })
  ]);

});

test('Global publisher should publish all content', t => {
  t = tapromise(t);
  t.plan(1);

  const actual = pub.publisher("l", Promise.resolve([l1, l2]), exporter).then(r => JSON.parse(r));
  t.match(actual, {
    languages: []
  });
});


test('Published module', root => {
  const module = {
    id: "mid",
    key: "mkey",
    icon: "micon",
    description: "mdesc",
    actionCards: ['card1' , 'othercard'],
    procedures: ['proc', 'newproc'],
    videos: ['avid'],
    keyLearningPoints: ['klp']
  };

  let refs = {
    images: new Set(),
    videos: new Set(),
    procedures: new Set(),
    actionCards: new Set(),
    keyLearningPoints: new Set()
  };

  const screens = new Map([['module:mkey', 'text']]);

  const actual = JSON.parse(pub.publishModule(l1, screens, module, (f,json) => json, refs));

  test('should contain action cards', t => {
    t.plan(1);
    t.match(actual, {actionCards:[]});
  });

  test('should collect referenced procedures', t => {
    t.plan(1);
    t.match([...refs.procedures], ['proc', 'newproc' ]);
  });

  test('should collect referenced action cards', t => {
    t.plan(1);
    t.match([...refs.actionCards], ['card1', 'othercard' ]);
  });

  test('should collect referenced icons', t => {
    t.plan(1);
    t.match([...refs.images], ['micon']);
  });

  test('should collect referenced videos', t => {
    t.plan(1);
    t.match([...refs.videos], ['avid']);
  });

  test('should use translated description', t => {
    console.log("actual", actual)
    t.plan(1);
    t.match(actual, {description: 'text'});
  });

  root.end();
});
