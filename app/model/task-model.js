var mongoose = require("mongoose");

var taskSchema = new mongoose.Schema({
  title: { type: String, required: true }
});

taskSchema.set("toJSON", {
  virtuals: true
});

exports.Task = mongoose.model("task", taskSchema);
