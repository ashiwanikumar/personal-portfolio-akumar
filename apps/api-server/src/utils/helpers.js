const fs = require("fs");
const path = require("path");
const logger = require("@utils/logger");

function loadRoutes(folderPath, app) {
  let count = 0;

  function walk(dir) {
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith(".js")) {
        const route = require(fullPath);
        app.use(`/api/${process.env.API_VERSION}`, route);
        count++;
      }
    });
  }

  walk(folderPath);
  logger.info(`[RouteLoader] Loaded ${count} route modules`);
}

module.exports = loadRoutes;
