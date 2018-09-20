const taskRoutes = require("./task-routes");
const columnRoutes = require("./column-routes");

module.exports = function(app, db) {
  taskRoutes(app, db);
  columnRoutes(app, db);
};
