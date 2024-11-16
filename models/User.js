const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
    phone: {
      type: String,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: "Please provide a valid 10-digit phone number",
      },
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 6,
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

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.checkPassword = async function ({ password }) {
  const isMatch = await bcrypt.compare(password, this.password);

  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
