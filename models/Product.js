const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Please provide product slug"],
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    images: {
      type: [String],
      required: true,
      validate: [
        {
          validator: (v) => Array.isArray(v) && v.length > 0,
          message: "Please provide at least one product image URL",
        },
      ],
      default: ["/uploads/example.jpeg"],
    },
    weight: {
      type: Number,
      required: [true, "Please provide product weight"],
      min: [0, "Weight must be a positive number"],
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: [true, "Please provide categoryId"],
    },
    subcategory: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      default: null,
      required: [true, "Please provide subcategoryId"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
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
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.id;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.id;
      },
    },
  }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
  justOne: false,
});

ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ productId: this._id });
});

module.exports = mongoose.model("Products", ProductSchema);
