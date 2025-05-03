const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide name"],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Please provide email"],
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid Email",
      },
    },
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: "Please provide a valid 10-digit phone number",
      },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    address: {
      street: { type: String, maxlength: 500 },
      city: { type: String, maxlength: 50 },
      state: { type: String, maxlength: 50 },
      zip: { type: String, maxlength: 50 },
      country: { type: String, maxlength: 50 },
    },
  },
  { strict: "throw" }
);

module.exports = mongoose.model("User", UserSchema);
