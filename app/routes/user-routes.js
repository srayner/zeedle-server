/**
 * There is a lot of duplication in this file,
 * and some of the methods are too long.
 * It will need refactoring at some point.
 */
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../model/user");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");
const verifyEmail = require("../email/account-verify");
const EmailService = require("../helpers/email");

function generateUsername(email) {
  const name = email.split(/[@.]+/)[0];
  const random = Math.floor(Math.random() * 10000);
  return name + random;
}

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
              const username = generateUsername(req.body.email);
              const user = new User({
                _id: new mongoose.Types.ObjectId(),
                username: username,
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

  // USER verify
  app.post("/user/verify", (req, res) => {
    try {
      const token = req.body.token;
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const details = { _id: new mongoose.Types.ObjectId(decoded.userId) };
      User.find(details)
        .exec()
        .then(users => {
          if (users.length < 1) {
            return res.status(400).json({ Message: "Bad request." });
          }
          users[0].verified = true;
          users[0].save();
          const accessToken = getAccessToken(users[0]._id, users[0].email);
          const refreshToken = getRefreshToken(users[0]._id, users[0].email);
          const message = "User verified, and logged in.";
          res.status(200).json({ message, accessToken, refreshToken });
        });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Bad request." });
    }
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
              const token = jwt.sign(
                {
                  email: users[0].email,
                  userId: users[0]._id
                },
                process.env.JWT_KEY,
                {
                  expiresIn: "15m"
                }
              );
              const refreshToken = jwt.sign(
                {
                  email: users[0].email,
                  userId: users[0]._id
                },
                process.env.JWT_REFRESH_KEY,
                {
                  expiresIn: "24h"
                }
              );
              return res.status(200).json({
                message: "Login suceeded.",
                user: {
                  username: users[0].username,
                  fullname: users[0].fullname,
                  initials: users[0].initials,
                  token: token,
                  refreshToken: refreshToken
                }
              });
            }
            return res.status(401).json({ Message: "Unauthorized." });
          }
        );
      })
      .catch();
  });

  // USER refresh
  app.post("/user/refresh", (req, res) => {
    const refreshToken = req.body.refreshToken;
    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ Message: "Unauthorized." });
      }
      User.find({ email: decoded.email })
        .exec()
        .then(users => {
          if (users.length < 1) {
            return res.status(401).json({ Message: "Unauthorized." });
          }
          const token = jwt.sign(
            {
              email: users[0].email,
              userId: users[0]._id
            },
            process.env.JWT_KEY,
            {
              expiresIn: "15m"
            }
          );
          const refreshToken = jwt.sign(
            {
              email: users[0].email,
              userId: users[0]._id
            },
            process.env.JWT_REFRESH_KEY,
            {
              expiresIn: "24h"
            }
          );
          return res.status(200).json({
            message: "Refresh suceeded.",
            user: {
              username: users[0].username,
              fullname: users[0].fullname,
              initials: users[0].initials,
              token: token,
              refreshToken: refreshToken
            }
          });
        });
    });
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

  // GET user
  app.get("/user/:id", checkAuth, (req, res) => {
    const query = { _id: new mongoose.Types.ObjectId(req.params.id) };
    User.find(query)
      .exec()
      .then(users => {
        if (users.length < 1) {
          return res.status(404).json({ Message: "Not found." });
        }
        res.send(users[0]);
      })
      .catch(err => {
        return res.status(500).json({ Message: "Sorry, an error occured." });
      });
  });

  // PATCH user
  app.patch("/user", checkAuth, (req, res) => {
    const userId = req.userData.userId;
    var patch = {
      initials: req.body.initials,
      fullname: req.body.fullname
    };
    User.findByIdAndUpdate(userId, patch)
      .exec()
      .then(users => {
        if (users.length < 1) {
          return res.status(404).json({ Message: "Not found." });
        }
        res.send(users[0]);
      })
      .catch(err => {
        return res.status(500).json({ Message: "Sorry, an error occured." });
      });
  });
};
