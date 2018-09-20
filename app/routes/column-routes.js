var ObjectID = require("mongodb").ObjectID;

module.exports = function(app, db) {
  // INDEX Columns
  app.get("/columns", (req, res) => {
    db.collection("columns")
      .find({})
      .toArray(function(err, result) {
        if (err) {
          res.send({ error: "An error occurred" });
        } else {
          res.send(result);
        }
      });
  });

  // CREATE Column
  app.post("/columns", (req, res) => {
    const column = req.body;
    db.collection("columns").insertOne(column, (err, result) => {
      if (err) {
        res.send({ error: "An error has occurred" });
      } else {
        res.send(result.ops[0]);
      }
    });
  });

  // READ Task
  app.get("/columns/:id", (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    db.collection("columns").findOne(details, (err, item) => {
      if (err) {
        res.send({ error: "An error has occured." });
      } else {
        res.send(item);
      }
    });
  });

  // UPDATE Column
  app.patch("/columns/:id", (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectID(id) };
    const update = { $set: { title: req.body.title } };
    db.collection("columns").updateOne(query, update, function(err, item) {
      if (err) {
        res.send({ error: "An error has occured." });
      } else {
        res.send({ message: "Column " + id + " updated." });
      }
    });
  });

  // DELETE Column
  app.delete("/columns/:id", (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    db.collection("columns").remove(details, (err, item) => {
      if (err) {
        res.send({ error: "An error occured" });
      } else {
        res.send({ message: "Column " + id + " deleted!" });
      }
    });
  });
};
