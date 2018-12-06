const taskRoutes = require("./task-routes");
const listRoutes = require("./list-routes");
const boardRoutes = require("./board-routes");

module.exports = function(app, db) {
  taskRoutes(app, db);
  listRoutes(app, db);
  boardRoutes(app, db);
};
