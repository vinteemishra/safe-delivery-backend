"use strict";
import { batchInsertEntities, insertMapping } from "./tablestorage";

import azure from "azure-storage";
import log from "../config/logging";

const entGen = azure.TableUtilities.entityGenerator;

function verifyEvent(evt) {
  return true;
}

export function verifyEvents(events) {
  return (
    Array.isArray(events) &&
    events.reduce((res, event) => res && verifyEvent(event), true)
  );
}

// Make RowKey more unique in case several events are fired with same ts
function eventToTask(evt, index) {
  return {
    PartitionKey: entGen.String(evt.appId),
    RowKey: entGen.String("" + evt.ts + "_" + index),
    eventTime: entGen.DateTime(new Date(evt.ts)),
    appId: entGen.String(evt.appId),
    sessId: entGen.String(evt.sessId),
    userId: evt.userId ? entGen.String(evt.userId) : null,
    eventType: entGen.String(evt.eventType),
    eventData: entGen.String(evt.eventData),
    locType: evt.location ? entGen.String(evt.location.type) : null,
    lat: evt.location ? entGen.Double(evt.location.lat) : null,
    lon: evt.location ? entGen.Double(evt.location.lon) : null,
  };
}

/**
 * Because of an error in the app, some events may be
 * missing an appId. So we just search for one which have
 * appId set.
 *
 */
function updateAppId(events) {
  const some = events.find(
    (e) => e.appId !== undefined && e.appId.trim() !== ""
  );
  return events.map((e) => ({ ...e, appId: some.appId }));
}

export function saveEvents(events) {
  let n = 0;
  const tasks = updateAppId(events).map((evt) => eventToTask(evt, n++));
  log.info(`Saving ${tasks.length} events`);
  return batchInsertEntities(tasks).then((r) => log.info("Inserted"));
}

export async function saveMapping(type, key, value) {
  // return Promise.resolve({}); // TODO Fix so the below code doesn't crash

  if (key === undefined) {
    log.error("trying to save mapping with no key");
    return;
  }
  try {
    let mapping = {
      PartitionKey: entGen.String(type),
      RowKey: entGen.String("" + type + "_" + key),
      type: entGen.String(type),
      key: entGen.String(key),
      description: entGen.String(value),
    };
    await insertMapping(mapping); //.then(r => log.info("Mapping added:", type, key, value)).catch(e => { log.error('Couldn\'t save...'); });
  } catch (e) {
    log.warn("Couldn't save mapping for key:", key);
    // return Promise.resolve({});
  }
}
