const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  full_name: String,
  email: String,
  phone: String,
  password: String,
  role: String,
  address: String,
  class: String,
});

const User = mongoose.model("user", userSchema);

module.exports = User;
