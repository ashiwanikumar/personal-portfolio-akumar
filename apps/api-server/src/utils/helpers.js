const fs = require("fs");
const path = require("path");

function loadRoutes(folderPath, app) {
  fs.readdirSync(folderPath).forEach((file) => {
    const fullPath = path.join(folderPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      loadRoutes(fullPath, app);
    } else if (file.endsWith(".js")) {
      const route = require(fullPath);
      app.use(`/api/${process.env.API_VERSION}`, route);
    }
  });
}

module.exports = loadRoutes;
