"use strict";

import {
  listBlobsSegmentedWithPrefix,
  contentURL,
} from "../../lib/blobstorage";

const DEFAULT_VERSION = "africa";

export function videoScreenKey(name) {
  return `video:${name}`;
}

const metaData = (videoEntry, thumbnailEntry) => {
  const meta = {
    href: contentURL(videoEntry.name),
    lastModified: Date.parse(videoEntry.lastModified),
  };

  const iconMeta = {
    icon: thumbnailEntry ? contentURL(thumbnailEntry.name) : undefined,
    iconLastModified: thumbnailEntry
      ? Date.parse(thumbnailEntry.lastModified)
      : undefined,
  };

  return { ...meta, ...(thumbnailEntry ? iconMeta : undefined) };
};

const getAllImages = async (prefix, input = [], next = null) => {
  var retval = [...input];
  const images = await listBlobsSegmentedWithPrefix(prefix, next);
  retval.push(...images.entries);
  if (images.continuationToken) {
    retval = await getAllImages(prefix, retval, images.continuationToken);
  }
  return retval;
};

const tranformImages = async (prefix, blobList) => {
  return blobList
    .map((entry) => {
      const name = entry.name;
      const noPrefix = name.substr(name.lastIndexOf(prefix) + prefix.length);
      const filename = noPrefix.substr(noPrefix.lastIndexOf("/") + 1);
      const basename = filename.substr(0, filename.indexOf("."));
      const noPrefixNoExt = noPrefix.substr(0, noPrefix.indexOf("."));
      const key = basename ? noPrefixNoExt : undefined;
      return { key: key, ...metaData(entry) };
    })
    .filter((entry) => !!entry.key);
};

export const listImages = async (version) => {
  let v = version || "default";

  if (v === "default") v = DEFAULT_VERSION;

  let prefix = `assets/images/${v}`;

  const images = await getAllImages(prefix);

  return tranformImages(prefix, images);
};

export const transformVideos = (prefix, blobList) => {
  const hasSpaces = (str) => {
    return str.indexOf(" ") !== -1;
  };
  let videos = new Map();
  let thumbnails = new Map();

  blobList.forEach((entry) => {
    const name = entry.name;
    const basename = name.substr(name.lastIndexOf(prefix) + prefix.length);
    const ext = basename.substr(basename.lastIndexOf(".") + 1);
    const key = basename.substr(0, basename.lastIndexOf("."));
    const lastFilename = key.split("/").pop();

    if (!!key) {
      if (ext === "mp4" && !hasSpaces(lastFilename)) {
        // We don't want files with spaces in them
        videos.set(key, entry);
      } else if (ext === "png") {
        thumbnails.set(key, entry);
      }
    }
  });
  let a = [];
  for (let k of videos.keys()) {
    a.push({ key: k, ...metaData(videos.get(k), thumbnails.get(k)) });
  }
  return a;
};

const getAllVideos = async (prefix, input = [], next = null) => {
  var retval = [...input];
  const videos = await listBlobsSegmentedWithPrefix(prefix, next);
  retval.push(...videos.entries);
  if (videos.continuationToken) {
    retval = await getAllVideos(prefix, retval, videos.continuationToken);
  }
  return retval;
};

export const listVideos = async () => {
  let prefix = "assets/videos";
  const videos = await getAllVideos(prefix);
  return transformVideos(prefix, videos);
};
