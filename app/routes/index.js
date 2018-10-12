const taskRoutes = require("./task-routes");
const columnRoutes = require("./column-routes");
const boardRoutes = require("./board-routes");

module.exports = function(app, db) {
  taskRoutes(app, db);
  columnRoutes(app, db);
  boardRoutes(app, db);
};
