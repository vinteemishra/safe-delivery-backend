import azure from "azure-storage";
import config from "../config";
import { splitArray } from "../lib/helper";
const TABLE = config.tableStorage.table;
const MAPPINGS_TABLE = config.tableStorage.mappingsTable;

const retryOperations = new azure.ExponentialRetryPolicyFilter();
export let tableService = azure
  .createTableService("sdacms", config.tableStorage.key)
  .withFilter(retryOperations);

export const createTable = () =>
  new Promise((resolve, reject) => {
    tableService.createTableIfNotExists(TABLE, (err, res, response) => {
      tableService.createTableIfNotExists(
        MAPPINGS_TABLE,
        (err2, res2, response2) => {
          if (err) {
            reject(err);
          } else if (err2) {
            reject(err2);
          } else {
            resolve([res, res2]);
          }
        }
      );
    });
  });

export const insertEntity = (task) =>
  new Promise((resolve, reject) => {
    tableService.insertEntity(TABLE, task, (err, res, response) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

export const insertMapping = (task) =>
  new Promise((resolve, reject) => {
    // tableService.insertEntity(MAPPINGS_TABLE, task, (err, res, response) => {
    tableService.insertOrReplaceEntity(
      MAPPINGS_TABLE,
      task,
      (err, res, response) => {
        if (err) reject(err);
        else resolve(res);
      }
    );
  });

export const queryEntries = (count, condition, ...args) =>
  new Promise((resolve, reject) => {
    var query = new azure.TableQuery().top(count).where(condition, args);

    tableService.queryEntities(
      TABLE,
      query,
      null,
      function (err, res, response) {
        if (err) reject(err);
        else resolve(res);
      }
    );
  });

export const batchInsertEntities = (tasks) => {
  const parts = splitArray(tasks, 100);
  return Promise.all(
    parts.map((part) => {
      return new Promise((resolve, reject) => {
        const batch = new azure.TableBatch();

        part.forEach((t) => batch.insertOrReplaceEntity(t));

        tableService.executeBatch(TABLE, batch, (err, res, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
    })
  );
};
