const taskRoutes = require("./task-routes");
const listRoutes = require("./list-routes");
const boardRoutes = require("./board-routes");
const userRoutes = require("./user-routes");

module.exports = function(app, db) {
  taskRoutes(app, db);
  listRoutes(app, db);
  boardRoutes(app, db);
  userRoutes(app, db);
};
