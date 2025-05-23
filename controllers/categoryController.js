const path = require("path");
const Category = require("../models/Category");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { fileUploadCloud } = require("../utils/cloudinaryUpload");

// Create a category or subcategory
const createCategory = async (req, res) => {
  const parentSlug = req.params?.parentSlug || null;
  let parentId = null;

  if (parentSlug) {
    const parentCategory = await Category.findOne({ slug: parentSlug });
    if (!parentCategory) {
      throw new CustomError.NotFoundError(
        `Parent category with slug: ${parentSlug} not found`
      );
    }
    parentId = parentCategory._id;
  }

  const category = await Category.create({
    ...req.body,
    parentId,
  });

  res.status(StatusCodes.CREATED).json({ category });
};

// Get all categories or subcategories under a parent
const getAllCategory = async (req, res) => {
  const parentSlug = req.params?.parentSlug || null;
  let categories;

  if (parentSlug) {
    const parentCategory = await Category.findOne({ slug: parentSlug });
    if (!parentCategory) {
      throw new CustomError.NotFoundError(
        `Parent category with slug: ${parentSlug} not found`
      );
    }
    categories = await Category.find({ parentId: parentCategory._id });
  } else {
    categories = await Category.find({ parentId: null });
  }

  res.status(StatusCodes.OK).json({
    categories,
    count: categories.length,
  });
};

// Update a category by ID
const updateCategory = async (req, res) => {
  const { id: categoryId } = req.params;

  const category = await Category.findByIdAndUpdate(categoryId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new CustomError.NotFoundError(
      `Category not found with id: ${categoryId}`
    );
  }

  res.status(StatusCodes.OK).json({ category });
};

// Delete a category by ID
const deleteCategory = async (req, res) => {
  const { id: categoryId } = req.params;

  const category = await Category.findByIdAndDelete(categoryId);

  if (!category) {
    throw new CustomError.NotFoundError(
      `Category not found with id: ${categoryId}`
    );
  }

  res.status(StatusCodes.OK).json({ msg: "Category deleted successfully" });
};

module.exports = {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
};
