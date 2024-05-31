"use strict";
import { getBlockBlobToBuffer } from "../lib/blobstorage";
import JSZip from "jszip";

// Wrap a function (blob, text) => {} to write into zip file
export default class ZipExporter {
  constructor(prefix, exporter) {
    this.exporter = exporter;
    this.zip = new JSZip();
    this.prefix = prefix;
  }

  async addEntry(name, text) {
    try {
      console.log("Add entry", name);
      const p = await this.exporter(name, text);

      const zipName = name.startsWith(this.prefix)
        ? name.substr(this.prefix.length)
        : name;
      this.zip.file(zipName, text);
      return p;
    } catch (err) {
      console.error("unable to addEntry " + name, err);
      throw err;
    }
  }

  async addAsset(src) {
    try {
      // console.log("Add asset", src);

      // Remove container from src path
      const i = src.substr(1).indexOf("/");
      const blob = src.substr(i + 2);
      const buf = await getBlockBlobToBuffer(decodeURI(blob));
      const zipName = src.substr(1);
      this.zip.file(zipName, buf);
    } catch (err) {
      console.error("Unable to read " + src, err);
      throw err;
    }
  }

  toBuffer() {
    // return this.zip.generateAsync({type: "nodebuffer"}, meta => console.log("add to zip", meta));
    return this.zip.generateAsync({ type: "nodebuffer" });
  }
}
