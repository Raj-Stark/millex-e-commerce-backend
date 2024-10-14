const Category = require("../models/Category");
const { StatusCodes } = require("http-status-codes");

const CustomError = require("../errors");

const MAX_CATEGORIES = 5;

const createCategory = async (req, res) => {
  const categoryCount = await Category.countDocuments();
  if (categoryCount >= MAX_CATEGORIES) {
    throw new CustomError.BadRequestError(
      `You cannot create more than ${MAX_CATEGORIES} categories.`
    );
  }

  const category = await Category.create(req.body);
  res.status(StatusCodes.CREATED).json({ category });
};
const getAllCategory = async (req, res) => {
  const categories = await Category.find({});
  res.status(StatusCodes.OK).json({ categories, count: categories.length });
};
const updateCategory = async (req, res) => {
  const { id: categoryId } = req.params;

  const category = await Category.findOneAndUpdate(
    { _id: categoryId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!category) {
    throw new CustomError.NotFoundError(
      `Category not found with id: ${categoryId}`
    );
  }

  res.status(StatusCodes.OK).json({ category });
};

const deleteCategory = async (req, res) => {
  const { id: categoryId } = req.params;

  const category = await Category.findOneAndDelete({ _id: categoryId });

  if (!category) {
    throw new CustomError.NotFoundError(
      `Category not found with id: ${categoryId}`
    );
  }

  res.status(StatusCodes.OK).json({ msg: "success" });
};

module.exports = {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
};
