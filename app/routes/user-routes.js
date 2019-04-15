const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../model/user");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");
const verifyEmail = require("../email/email-verify");
const EmailService = require("../helpers/email");

module.exports = function(app, db) {
  function getAccessToken(_id, email) {
    return jwt.sign({ _id, email }, process.env.JWT_KEY, {
      expiresIn: "15m"
    });
  }

  function getRefreshToken(_id, email) {
    return jwt.sign({ _id, email }, process.env.JWT_REFRESH_KEY, {
      expiresIn: "24h"
    });
  }

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
                password: hash,
                verified: false
              });
              const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY);
              const url = process.env.LOCAL_SERVER + "/verify?token=" + token;
              const link = '<a href="' + url + '">' + url + "</a>";
              const mailSubject = verifyEmail.subject;
              const mailBody = verifyEmail.body(link);
              user
                .save()
                .then(result => {
                  EmailService.sendMail(req.body.email, mailSubject, mailBody)
                    .then(() => {
                      console.log("Mail sent ok.");
                    })
                    .catch(err => {
                      console.log("Error sending mail.", err);
                    });
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
    console.log(process.env);
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
              const token = jwt.sign(
                {
                  email: users[0].email,
                  userId: users[0]._id
                },
                process.env.JWT_KEY,
                {
                  expiresIn: "1h"
                }
              );
              return res.status(200).json({
                message: "Login suceeded.",
                token: token
              });
            }
            return res.status(401).json({ Message: "Unauthorized." });
          }
        );
      })
      .catch();
  });

  // USER delete
  app.delete("/user/:id", checkAuth, (req, res) => {
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
  app.get("/users", checkAuth, (req, res) => {
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
