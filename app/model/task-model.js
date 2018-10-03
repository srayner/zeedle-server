var mongoose = require("mongoose");

var taskSchema = new mongoose.Schema({
  title: { type: String, required: true }
});

exports.Task = mongoose.model("task", taskSchema);
