'use strict';

import azure from 'azure-storage';
import config from '../../config'
import { countryInfo } from "./countryData";

const countries = Object.entries(countryInfo.countries).map(([key, value]) => ({ iso: key, ...value }));

function findISOByName(name) {
  const result = countries.find(c => (c.name || "").toLowerCase() === (name || "").toLowerCase());
  if (result) {
    return result.iso;
  } else {
    return "Unknown";
  }
}

const retryOperations = new azure.ExponentialRetryPolicyFilter();
export let tableService = azure.createTableService('sdaprofile', config.tableStorageProfile.key).withFilter(retryOperations);

export const queryCountryByAppId = (appId) => {
  return new Promise((resolve, reject) => {
    var query = new azure.TableQuery()
      .select('Country')
      .top(1)
      .where('AppId == ?', appId);

    tableService.queryEntities('countrylookup', query, null, function(err, res, response) {
      if (err || response.error) {
        reject(err);
      }
      else {
        resolve(res);
      }
    });
  });
};


export const countryLookup = async (ctx) => {
    try {
        const appId = ctx.request.body.appId || ctx.request.body.appid || ctx.request.body.AppId;
        if (appId === undefined || appId.trim().length === 0) {
            ctx.status = 400;
            ctx.body = { error: 'Missing appId' };
            return;
        }

        const result = await queryCountryByAppId(appId);
        if (result.entries === undefined || result.entries.length === 0) {
            ctx.body = { country: 'Unknown' };
            return;
        }

        // At this point we have a valid country (or 'Unknown' from TableStorage)
        const { Country } = result.entries[0];
        const countryName = Country['_'];
        const ISO = findISOByName(countryName);

        console.log({Country, countryName, ISO});

        ctx.body = { country: ISO };
    } catch (e) {
        ctx.status = 500;
        ctx.body = { error: e };
    }
};
