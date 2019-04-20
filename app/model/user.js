const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  verified: { type: Boolean, required: true },
  fullname: { type: String, required: false },
  initials: { type: String, required: false }
});

module.exports = mongoose.model("User", userSchema);
