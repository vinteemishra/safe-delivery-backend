'use strict';

require('babel-register/lib/node.js');
require('babel-polyfill/dist/polyfill.js');

const fs = require('fs');
const azure = require('azure-storage');

const key = '4GuU6SSsp7O/1F7sdF8NsBCJFZIl7cFf1EehM+kqRqFEt8P9TeunKDV+neGqP13dld7S1CXqO1onSkgTVzEE4g==';

const retryOperations = new azure.ExponentialRetryPolicyFilter();
const tableService = azure.createTableService('sdacms', key).withFilter(retryOperations);

var query = new azure.TableQuery();
const OUTPUT_FILE = "./table-events.csv";

try {
    fs.unlinkSync(OUTPUT_FILE);
} catch (e) {
    console.log("No output file.");
}

const extractContent = (o) => {
    const res = {};
    for (const e of Object.entries(o)) {
        res[e[0]] = e[1]._;
    }
    return res;
}

async function readEntries(outStream, continuationToken) {
    return new Promise((resolve, reject) => {
        tableService.queryEntities("events", query, continuationToken, function (err, res, response) {
            if (err) {
                reject(err);
            } else {
                for (const e of res.entries) {
                    outStream.write(JSON.stringify(extractContent(e), null, 0));
                    outStream.write('\n');
                }
                resolve({ continuationToken: res.continuationToken, length: res.entries.length });
            }
        });
    });
}

async function run() {
    const outputStream = fs.createWriteStream(OUTPUT_FILE);

    let runningCount = 0;
    let continuationToken = null;
    do {
        try {
            const result = await readEntries(outputStream, continuationToken);
            continuationToken = result.continuationToken;
            runningCount += result.length;
        } catch (e) {
            console.error(e);
        }
        console.log("runningCount:", runningCount);
    } while (continuationToken);

    outputStream.close();
}

run();

