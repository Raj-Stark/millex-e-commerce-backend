const mongoose = require("mongoose");

const SingleOrderSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },

  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true,
  },
  metaData: {
    type: Object,
    default: {},
  },
});

const OrderSchema = mongoose.Schema(
  {
    tax: {
      type: Number,
      required: true,
    },

    shippingFee: {
      type: Number,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },

    orderItems: [SingleOrderSchema],
    status: {
      type: String,
      enum: ["pending", "failed", "paid", "delivered", "canceled"],
      default: "pending",
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", OrderSchema);
