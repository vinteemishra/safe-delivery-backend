console.log(`${new Date()} Starting app, node ${process.version}`);

require("babel-register");
require("babel-polyfill");
const config = require("./server/config");
const log = require("./server/config/logging");
const app = require("./server/server");

// http://www.marcusoft.net/2015/10/eaddrinuse-when-watching-tests-with-mocha-and-supertest.html
// Check for module parent and export app, otherwise app.listen()
// This is so that it is easy to test application or use it with clustering
//
if (!module.parent || config.env === "production") {
  app.listen(config.port, config.ip, () => {
    log.info(
      `SDA CMS listening on ${config.port}, in ${config.env} mode. Versions: app ${config.version}, node ${process.version}`
    );
  });
} else {
  module.exports = app;
}
