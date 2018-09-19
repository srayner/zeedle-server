const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const port = 8000;
const app = express();

var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
};

app.use(bodyParser.json());
app.use(allowCrossDomain);

MongoClient.connect(
  "mongodb://localhost:27017/zeedle",
  (err, database) => {
    if (err) return console.log(err);

    db = database.db("zeedle");
    require("./app/routes")(app, db);

    app.listen(port, () => {
      console.log("We are live on localhost:" + port);
    });
  }
);
