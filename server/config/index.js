"use strict";

const path = require("path");
const fs = require("fs");

const env = process.env.NODE_ENV || "dev";

const config = {
  version: fs.readFileSync("version.txt", "ascii").trim(),
  env: env,
  root: path.normalize(__dirname + "../../"),
  ip: process.env.IP || "0.0.0.0",
  port: process.env.PORT || 9000,
  logType: env === "dev" ? "dev" : "combined",
  durationService: {
    apiKey: "gQzB7EwqGsrrPpWrxl9F1toCnNAOKW1vKyf3B1ZOXzY5HyTUV0",
    host: "sdacms-duration.westeurope.cloudapp.azure.com",
    port: 3000,
  },
  apkService: {
    apiKey: "gQzB7EwqGsrrPpWrxl9F1toCnNAOKW1vKyf3B1ZOXzY5HyTUV0",
    host: "sdacms-duration.westeurope.cloudapp.azure.com",
    port: 3020,
  },
  certificationService: {
    apiKey: "gQzB7EwqGsrrPpWrxl9F1toCnNAOKW1vKyf3B1ZOXzY5HyTUV0",
    host: "sdacms-duration.westeurope.cloudapp.azure.com",
    port: 3010,
  },
  documentdb: {
    url: "https://sdacms.documents.azure.com:443/",
    key: "LYwIS46JsMK1LdAMWoguUFbOrUC3Pvm9bHtEmxuUqkiPiDS52xRNvKt9kkh0J2xZmhqASVK1elrJPprPGRpwsQ==",
  },
  profilesDb: {
    url: "https://sdaprofile.documents.azure.com:443/",
    key: "IQdc1efpmp92FfOhAGcBkroKPiSH6P5L1VfQlvZQiixlqOwfIjkb4ILzYhxfI7ddjSQFZpNe3WAHBqN3tsaSKA==",
  },
  profiledDbIndia: {
    url: "https://sdaprofile-india.documents.azure.com:443/",
    key: "vqSS81IiMnrrNZW4LhCUPBAUDAx1PDeIb4QOKqfr2PsC8CZ3eEeuJZCCd85nzfcp853yOYb2J5GAwi8QdAd1TA==",
  },
  blobStorage: {
    key: "4GuU6SSsp7O/1F7sdF8NsBCJFZIl7cFf1EehM+kqRqFEt8P9TeunKDV+neGqP13dld7S1CXqO1onSkgTVzEE4g==",
  },
  actionsDb: {
    url: "https://sdaactions.documents.azure.com:443/",
    key: "ngKP9CcGl543NCRHbP0mA9f3jPkHdjrYcUeWNVym759XP1Ri3cFwkYbTKo3QYEDEXbgdWTfb2tOVUTrMPBInxQ==",
  },
  tableStorage: {
    table: env === "dev" ? "devevents" : "events",
    mappingsTable: env === "dev" ? "devmappings" : "mappings",
    key: "4GuU6SSsp7O/1F7sdF8NsBCJFZIl7cFf1EehM+kqRqFEt8P9TeunKDV+neGqP13dld7S1CXqO1onSkgTVzEE4g==",
  },
  tableStorageProfile: {
    key: "bOGH1ORan5IHoESEbgc9WLC4nitQ1ux7RdqcNLeGKaZU6iUw1lu2GEYZHQ7AxpL28gmEoEhdeJIwpl9LFdOIJg==",
  },
  turnToken:
    "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJUdXJuIiwiZXhwIjoxNzk4ODEzNDQ4LCJpYXQiOjE2ODk2OTAyODIsImlzcyI6IlR1cm4iLCJqdGkiOiIwMzBjMGMwMC01ODgyLTQ3YzYtOThmYS03NjdlZjE3NGJiM2UiLCJuYmYiOjE2ODk2OTAyODEsInN1YiI6Im51bWJlcjoyODQxIiwidHlwIjoiYWNjZXNzIn0.Rb0PH9YwQEUt4mjhtXsfMQc8QWTN7dhKN2K2kwQdhpgKvmMooS7lXPd_i8korwfasaPvFkN2A_Euid4IXpBttA",
  sqlServer: {
    user: "sdaadmin",
    password: process.env.SQL_PASSWORD,
    server: "sdacms.database.windows.net",
    database: "events",
    requestTimeout: 0,
    options: {
      encrypt: true,
    },
  },
};

export default config;
