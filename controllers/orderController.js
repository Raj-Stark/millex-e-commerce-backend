const Order = require("../models/Order");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No Cart Items provided");
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError("Please provide tax & shipping fee");
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.BadRequestError(
        `No product with this id: ${item.product}`
      );
    }

    const { name, price, image, _id } = dbProduct;

    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    orderItems = [...orderItems, singleOrderItem];

    subtotal += item.amount * price;
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
  const orders = await Order.find({});

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

  res.status(StatusCodes.OK).json({ orders, count: orders.length });
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
