"use strict";
import * as http from "http";
import config from "../../config";
import { httpRequest } from "../../lib/httpUtil";

export function listApks(langId) {
  var options = {
    host: config.apkService.host,
    path: "/list?langId=" + langId,
    port: config.apkService.port,
    headers: { "x-sda-auth": config.apkService.apiKey },
  };
  return httpRequest(options);
}

export function getStatus() {
  var options = {
    host: config.apkService.host,
    path: "/status",
    port: config.apkService.port,
    headers: { "x-sda-auth": config.apkService.apiKey },
  };
  return httpRequest(options);
}

export function generateApk(langId, draft) {
  var options = {
    host: config.apkService.host,
    path: `/apk?langId=${langId}&draft=${draft}`,
    port: config.apkService.port,
    headers: { "x-sda-auth": config.apkService.apiKey },
  };
  return httpRequest(options);
}

export function downloadLatestApk(langId) {
  var options = {
    host: config.apkService.host,
    path: `/latest?langId=${langId}`,
    port: config.apkService.port,
    headers: { "x-sda-auth": config.apkService.apiKey },
  };
  // Return a stream
  return new Promise((resolve, reject) => {
    http.get(options, (res) => {
      resolve(res);
    });
  });
}
