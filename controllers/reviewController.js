const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const createReview = async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findOne({ _id: productId });

  const userId = req.user.userId;

  if (!product) {
    throw new CustomError.NotFoundError("No product found with this id");
  }

  const alreadySubmitted = await Review.findOne({
    productId: productId,
    userId: req.user.userId,
  });

  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      "Already submitted review for this product"
    );
  }

  req.body.userId = req.user.userId;

  const review = await Review.create(req.body);

  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReview = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "userId",
    select: "name",
  });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
  res.send("Get All Reviews");
};
const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const { rating, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(
      `No review found with this ID ${reviewId}`
    );
  }

  review.rating = rating;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(
      `No review found with this ID ${reviewId}`
    );
  }

  await review.remove();

  res.status(StatusCodes.OK).json({ msg: "success" });
};

module.exports = {
  createReview,
  getAllReview,
  getSingleReview,
  updateReview,
  deleteReview,
};
