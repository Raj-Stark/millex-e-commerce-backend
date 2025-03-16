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
      default: null,
    },
    slug: {
      type: String,
      required: [true, "Please provide category slug"],
      unique: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    attributes: [
      {
        name: String,
        enum: ["boolean", "string", "number", "date"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", CategorySchema);
