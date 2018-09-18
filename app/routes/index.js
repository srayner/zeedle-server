const taskRoutes = require("./task-routes");

module.exports = function(app, db) {
  taskRoutes(app, db);
};
