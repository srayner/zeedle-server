var ObjectID = require("mongodb").ObjectID;
const Task = require("../model/task-model").Task;
const checkAuth = require("../middleware/check-auth");

module.exports = function(app, db) {
  // INDEX Tasks
  app.get("/tasks", checkAuth, (req, res) => {
    const query = req.query.hasOwnProperty("boardId")
      ? { boardId: req.query.boardId }
      : {};
    Task.find(query).then((err, tasks) => {
      if (err) {
        res.send(err);
      } else {
        res.send(tasks);
      }
    });
  });

  // CREATE Task
  app.post("/tasks", checkAuth, (req, res) => {
    const data = new Task(req.body);
    data.save((err, task) => {
      if (err) {
        res.send({ error: "An error has occurred." });
      } else {
        res.send(task);
      }
    });
  });

  // READ Task
  app.get("/tasks/:id", checkAuth, (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    db.collection("tasks").findOne(details, (err, item) => {
      if (err) {
        res.send({ error: "An error has occured." });
      } else {
        res.send(item);
      }
    });
  });

  // UPDATE Task
  app.patch("/tasks/:id", checkAuth, (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectID(id) };
    const update = {
      $set: { title: req.body.title, description: req.body.description }
    };
    db.collection("tasks").updateOne(query, update, function(err, item) {
      if (err) {
        res.send({ error: "An error has occured." });
      } else {
        res.send({ message: "Task " + id + " updated." });
      }
    });
  });

  // DELETE Task
  app.delete("/tasks/:id", checkAuth, (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    db.collection("tasks").remove(details, (err, item) => {
      if (err) {
        res.send({ error: "An error occured" });
      } else {
        res.send({ message: "Task " + id + " deleted!" });
      }
    });
  });
};
