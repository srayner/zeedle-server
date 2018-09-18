var ObjectID = require("mongodb").ObjectID;

module.exports = function(app, db) {
  // INDEX Tasks
  app.get("/tasks", (req, res) => {
    db.collection("tasks")
      .find({})
      .toArray(function(err, result) {
        if (err) {
          res.send({ error: "An error occurred" });
        } else {
          res.send(result);
        }
      });
  });

  // CREATE Task
  app.post("/tasks", (req, res) => {
    const task = req.body;
    db.collection("tasks").insertOne(task, (err, result) => {
      if (err) {
        res.send({ error: "An error has occurred" });
      } else {
        res.send(result.ops[0]);
      }
    });
  });

  // READ Task
  app.get("/tasks/:id", (req, res) => {
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
  app.patch("/tasks/:id", (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectID(id) };
    const update = { $set: { title: req.body.title } };
    db.collection("tasks").updateOne(query, update, function(err, item) {
      if (err) {
        res.send({ error: "An error has occured." });
      } else {
        res.send({ message: "Task " + id + " updated." });
      }
    });
  });

  // DELETE Task
  app.delete("/tasks/:id", (req, res) => {
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
