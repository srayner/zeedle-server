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

  // USER sign in
  app.post("/user/sign-in", (req, res) => {
    res.send({ result: "ok" });
  });
};
