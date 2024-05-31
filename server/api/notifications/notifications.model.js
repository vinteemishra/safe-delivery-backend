"use strict";

import { stampDoc, dbClient } from "../../lib/documentdb";

const NOTIFICATIONS = "notifications";

function getNotifications(langId, notificationKey) {
  let query = "c.langId = @langId";
  let params = [{ name: "@langId", value: langId }];
  if (notificationKey) {
    params.push({ name: "@notificationKey", value: notificationKey });
    query += " AND c.key = @notificationKey";
  }

  return dbClient.queryDocs(NOTIFICATIONS, {
    query: query,
    parameters: params,
  });
}

export const mergeNotification = (langId, master, translated) => {
  if (!translated) {
    let { id, ...notification } = {
      ...master,
      langId: langId,
      adapted: master.content,
      translated: master.content,
    };
    return notification;
  }

  let notification = { ...translated, content: master.content };

  return notification;
};

export function list(langId) {
  return find(undefined, langId);
}

export function find(notificationKey, langId) {
  const masters = getNotifications("", notificationKey);
  if (!langId) {
    return masters;
  }

  const translated = getNotifications(langId, notificationKey);

  return Promise.all([masters, translated]).then((r) => {
    const [ms, ts] = r;

    const existingNotifications = new Map(ts.map((t) => [t.key, t]));

    const mergedNotifications = ms.map((m) =>
      mergeNotification(langId, m, existingNotifications.get(m.key))
    );

    return mergedNotifications;
  });
}

export function update(user, notification) {
  console.log("Update notification", notification);

  return dbClient.upsertDoc(NOTIFICATIONS, stampDoc(notification, user));
}

export function insert(user, notification) {
  console.log("Insert notification", notification);
  return dbClient.upsertDoc(NOTIFICATIONS, stampDoc(notification, user));
}

export function remove(notificationKey) {
  return dbClient
    .queryDocs(NOTIFICATIONS, {
      query: "c.key = @key",
      parameters: [{ name: "@key", value: notificationKey }],
      projection: "c.id",
    })
    .then((ids) => {
      const deletes = ids.map((row) => {
        console.log("Del notification", row.id);
        return dbClient.deleteDoc(row.id);
      });

      return Promise.all(deletes);
    });
}
