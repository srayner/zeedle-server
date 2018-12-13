const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../model/user");

module.exports = function(app, db) {
  // USER signup
  app.post("/user/signup", (req, res) => {
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        if (user.length >= 1) {
          return res
            .status(409)
            .json({ message: "Email address already taken." });
        } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({ error: err });
            } else {
              const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash
              });
              user
                .save()
                .then(result => {
                  res.status(201).json({ message: "User created." });
                })
                .catch(err => {
                  res.status(500).json({ error: err });
                });
            }
          });
        }
      })
      .catch();
  });

  // USER login
  app.post("/user/login", (req, res) => {
    User.find({ email: req.body.email })
      .exec()
      .then(users => {
        if (users.length < 1) {
          return res.status(401).json({ Message: "Unauthorized." });
        }
        bcrypt.compare(
          req.body.password,
          users[0].password,
          (error, result) => {
            if (error) {
              return res.status(401).json({ Message: "Unauthorized." });
            }
            if (result) {
              return res.status(200).json({ message: "Login suceeded." });
            }
            return res.status(401).json({ Message: "Unauthorized." });
          }
        );
      })
      .catch();
  });

  // USER delete
  app.delete("/user/:id", (req, res) => {
    User.remove({ _id: req.body.id })
      .exec()
      .then(() => {
        res.status(200).json({ Message: "User deleted." });
      })
      .catch(() => {
        res.status(500).json({ error: err });
      });
  });

  // INDEX users
  app.get("/users", (req, res) => {
    db.collection("users")
      .find({})
      .toArray(function(err, result) {
        if (err) {
          res.send({ error: "An error occurred" });
        } else {
          res.send(result);
        }
      });
  });
};
