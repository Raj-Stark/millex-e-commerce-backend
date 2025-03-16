const Category = require("../models/Category");
const { StatusCodes } = require("http-status-codes");

const CustomError = require("../errors");

const createCategory = async (req, res) => {
  /**
   * @type {string | undefined} parentId
   */
  const parentSlug = req?.params?.parentSlug || null;

  let parentId = null;

  if (parentSlug) {
    const parentCategory = await Category.findOne({ slug: parentSlug });
    if (!parentCategory) {
      throw new CustomError.NotFoundError(
        `Category with id: ${parentId} not found`
      );
    }
    parentId = parentCategory._id;
  }

  // @Deprecated
  // if (categoryCount >= MAX_CATEGORIES) {
  //   throw new CustomError.BadRequestError(
  //     `You cannot create more than ${MAX_CATEGORIES} categories.`
  //   );
  // }

  const category = await Category.create({
    ...req.body,
    parentId,
  });

  res.status(StatusCodes.CREATED).json({ category });
};

const getAllCategory = async (req, res) => {
  const parentSlug = req?.params?.parentSlug || null;
  let categories;
  if (parentSlug) {
    const parentCategory = await Category.findOne({ slug: parentSlug });
    if (!parentCategory) {
      throw new CustomError.NotFoundError(
        `Category with slug: ${parentSlug} not found`
      );
    }
    categories = await Category.find({ parentId: parentCategory._id });
  } else {
    categories = await Category.find({ parentId: null });
  }
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
