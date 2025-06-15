const Order = require("../models/Order");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const User = require("../models/User");
const { createCashfreeOrder } = require("../utils/cashfree");

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee, paymentMode } = req.body;

  // Basic validations
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No cart items provided");
  }

  if (typeof tax !== "number" || typeof shippingFee !== "number") {
    throw new CustomError.BadRequestError(
      "Please provide valid tax and shipping fee"
    );
  }

  if (!["cod", "online"].includes(paymentMode)) {
    throw new CustomError.BadRequestError("Invalid payment mode");
  }

  // ✅ Validate user details
  const user = await User.findById(req.user.userId);
  if (
    !user ||
    !user.name ||
    !user.email ||
    !user.phone ||
    !user.address?.street ||
    !user.address?.city ||
    !user.address?.state ||
    !user.address?.zip ||
    !user.address?.country
  ) {
    throw new CustomError.BadRequestError(
      "Please complete your billing details (name, email, phone, and address) before placing the order."
    );
  }

  // ✅ Validate products
  const productIds = cartItems.map((item) => item.product);

  const dbProducts = await Product.find({ _id: { $in: productIds } });

  const productMap = new Map();
  dbProducts.forEach((product) =>
    productMap.set(product._id.toString(), product)
  );

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const productId = item.product?._id || item.product;
    const product = productMap.get(productId.toString());

    if (!product) {
      throw new CustomError.BadRequestError(
        `No product found with ID: ${productId}`
      );
    }

    orderItems.push({
      name: product.name,
      image: product.images[0],
      price: product.price,
      amount: item.amount,
      product: product._id,
    });

    subtotal += product.price * item.amount;
  }

  const total = subtotal + tax + shippingFee;

  // ✅ Create Order
  const order = await Order.create({
    orderItems,
    subtotal,
    tax,
    shippingFee,
    total,
    user: req.user.userId,
    status: "pending",
  });

  // ✅ Handle COD
  if (paymentMode === "cod") {
    return res.status(StatusCodes.CREATED).json({
      order,
      message: "Order placed successfully with Cash on Delivery",
    });
  }

  const { paymentUrl, sessionId } = await createCashfreeOrder(order, user);

  res.status(StatusCodes.CREATED).json({
    order,
    paymentUrl,
    sessionId,
  });
};

const getAllOrder = async (req, res) => {
  const orders = await Order.find({}).populate("user");

  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.prams;

  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new CustomError.BadRequestError(
      `No product with this id: ${orderId}`
    );
  }

  res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });

  const reversedOrders = orders.reverse();

  res
    .status(StatusCodes.OK)
    .json({ orders: reversedOrders, count: orders.length });
};

const updateOrder = async (req, res) => {
  res.send("Update Order");
};

module.exports = {
  createOrder,
  getAllOrder,
  getSingleOrder,
  getCurrentUserOrders,
  updateOrder,
};
