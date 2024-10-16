const { fileUploadCloud } = require("../utils/cloudinaryUpload");
const CustomError = require("../errors");
const path = require("path");
const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");

// ! Create Product
const createProduct = async (req, res) => {
  const product = await Product.create(req.body);

  res.status(StatusCodes.CREATED).json({ product });
};

// ! Update Product
const updateProduct = async (req, res) => {
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with ID: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

// ! Delete Product
const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with ID: ${productId}`);
  }

  await product.remove();

  res.status(StatusCodes.OK).json({ msg: "success" });
};

// ! Get All Product
const getAllProduct = async (req, res) => {
  const products = await Product.find({}).populate("category");

  res.status(StatusCodes.OK).json({ products, count: products.length });
};

// ! Get Single Product

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId })
    .populate("category")
    .populate({
      path: "reviews",
      populate: {
        path: "userId",
        select: "name email",
      },
    });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with ID: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};
// ! Upload Image
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new CustomError.BadRequestError(
        "Please add an image of the product"
      );
    }

    const maxSize = 2 * 1024 * 1024;
    if (req.file.size > maxSize) {
      throw new CustomError.BadRequestError("Please upload an image under 2MB");
    }

    if (!req.file.mimetype.startsWith("image")) {
      throw new CustomError.BadRequestError("Please upload an image file");
    }

    const localFilePath = path.join(__dirname, "../uploads", req.file.filename);
    const result = await fileUploadCloud(localFilePath);

    if (!result) {
      throw new CustomError.BadRequestError(
        "Failed to upload image to Cloudinary"
      );
    }

    res
      .status(StatusCodes.CREATED)
      .json({ msg: "success", imageUrl: result.secure_url });
  } catch (error) {
    next(error);
  }
};

// ! Get Product By Category ID
const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  console.log("Category ID:", categoryId);

  const products = await Product.find({ category: categoryId }).populate(
    "category"
  );

  if (!products || products.length === 0) {
    throw new CustomError.NotFoundError(
      `No products found for category ID: ${categoryId}`
    );
  }

  res.status(StatusCodes.OK).json({ products, count: products.length });
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getSingleProduct,
  uploadImage,
  getProductsByCategory,
};
