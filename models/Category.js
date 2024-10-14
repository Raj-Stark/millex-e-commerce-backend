const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide category name"],
      unique: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    image: {
      type: String,
      required: [true, "Please provide category image URL"],
      default: "/uploads/category-image.jpeg",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", CategorySchema);
