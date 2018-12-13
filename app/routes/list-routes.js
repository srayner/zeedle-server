var ObjectID = require("mongodb").ObjectID;
const checkAuth = require("../middleware/check-auth");

module.exports = function(app, db) {
  // INDEX Lists
  app.get("/lists", checkAuth, (req, res) => {
    if (req.query.hasOwnProperty("boardId")) {
      db.collection("boards").findOne(
        { _id: new ObjectID(req.query.boardId) },
        function(err, board) {
          if (err) {
            res.send({ error: "An error occured" });
          } else {
            if (board !== null) {
              const objectIds = board.listIds.map(function(id) {
                return new ObjectID(id);
              });
              db.collection("lists")
                .find({ _id: { $in: objectIds } })
                .toArray(function(err, result) {
                  if (err) {
                    res.send({ error: "An error occurred" });
                  } else {
                    res.send(result);
                  }
                });
            } else {
              res.send("Board not found");
            }
          }
        }
      );
    } else {
      db.collection("lists")
        .find({})
        .toArray(function(err, result) {
          if (err) {
            res.send({ error: "An error occurred" });
          } else {
            res.send(result);
          }
        });
    }
  });

  // CREATE List
  app.post("/lists", checkAuth, (req, res) => {
    const list = req.body;
    db.collection("lists").insertOne(list, (err, result) => {
      if (err) {
        res.send({ error: "An error has occurred" });
      } else {
        res.send(result.ops[0]);
      }
    });
  });

  // READ List
  app.get("/lists/:id", checkAuth, (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    db.collection("lists").findOne(details, (err, item) => {
      if (err) {
        res.send({ error: "An error has occured." });
      } else {
        res.send(item);
      }
    });
  });

  // UPDATE List
  app.patch("/lists/:id", checkAuth, (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectID(id) };
    const update = {
      $set: {
        title: req.body.title,
        taskIds: req.body.taskIds
      }
    };
    db.collection("lists").updateOne(query, update, function(err, item) {
      if (err) {
        res.send({ error: "An error has occured." });
      } else {
        res.send({ message: "List " + id + " updated." });
      }
    });
  });

  // DELETE List
  app.delete("/lists/:id", checkAuth, (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    db.collection("lists").remove(details, (err, item) => {
      if (err) {
        res.send({ error: "An error occured" });
      } else {
        res.send({ message: "List " + id + " deleted!" });
      }
    });
  });
};
