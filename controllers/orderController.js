const Order = require("../models/Order");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  console.log("Incoming Order Payload:", req.body);

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No Cart Items provided");
  }

  if (tax === undefined || shippingFee === undefined) {
    throw new CustomError.BadRequestError("Please provide tax & shipping fee");
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    // Optional: validate that product ID exists
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.BadRequestError(
        `No product with this id: ${item.product}`
      );
    }

    const singleOrderItem = {
      amount: item.amount,
      name: item.name,
      price: item.price,
      image: item.image,
      product: item.product,
    };

    orderItems.push(singleOrderItem);

    subtotal += item.amount * item.price;
  }

  const total = tax + shippingFee + subtotal;

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    user: req.user.userId,
  });

  res.status(StatusCodes.CREATED).json({ order });
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
