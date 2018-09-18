const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const port = 8000;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

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
