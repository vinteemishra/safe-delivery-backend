"use strict";

import { test } from "babel-tap";
import { mergeChapters } from "../lib/chapters";

const cards = [
  { id: "i1", content: "c1" },
  { id: "i2", content: "c2" },
  { id: "i3", content: "c3" },
  { id: "i4", content: "c4" },
];
const [c1, c2, c3, c4] = cards;

const chapters = [
  { key: "k1", description: "d1", cards: [c1, c2] },
  { key: "k2", description: "d2", cards: [c4] },
  { key: "k3", description: "d3", cards: [c4] },
];
const [ch1, ch2, ch3] = chapters;

const master = {
  langId: "",
  id: "mid",
  key: "key",
  description: "desc",
  chapters: [ch1, ch2],
};

const translatedCards = [
  { id: "i1", content: "c_11", adapted: "ch1", translated: "t1" },
  { id: "i2", content: "c_21", adapted: "ch2", translated: "t2" },
  { id: "i3", content: "c_31", adapted: "ch3", translated: "t3" },
];
const [t1, t2, t3] = translatedCards;

test("mergeChapters should return same action cards as master when t contains different cards", (t) => {
  t.plan(6);
  t.match(mergeChapters(master, { ...master, chapters: [] }), master.chapters);
  t.match(
    mergeChapters(master, { ...master, chapters: [ch1] }),
    master.chapters
  );
  t.match(
    mergeChapters(master, { ...master, chapters: [ch2] }),
    master.chapters
  );
  t.match(
    mergeChapters(master, { ...master, chapters: [ch1, ch2] }),
    master.chapters
  );
  t.match(
    mergeChapters(master, { ...master, chapters: [ch1, ch2, ch3] }),
    master.chapters
  );
  t.match(
    mergeChapters(master, { ...master, chapters: [ch3] }),
    master.chapters
  );
});
