const { fileUploadCloud } = require("../utils/cloudinaryUpload");
const CustomError = require("../errors");
const path = require("path");
const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const Category = require("../models/Category");

// ! Create Product
const createProduct = async (req, res) => {
  const { categoryId, ...rest } = req.body;

  if (!categoryId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide categoryId" });
  }

  const product = await Product.create({
    ...rest,
    category: categoryId,
  });

  res.status(StatusCodes.CREATED).json({ product });
};

// ! Update Product
const updateProduct = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    throw new CustomError.NotFoundError(`No product with ID: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

// ! Delete Product
const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findByIdAndDelete(productId); // <-- ✅ one line

  if (!product) {
    throw new CustomError.NotFoundError(`No product with ID: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ msg: "success" });
};

// ! Get All Product
const getAllProduct = async (req, res) => {
  const products = await Product.find({}).populate("category");

  res.status(StatusCodes.OK).json({ products, count: products.length });
};

// ! Get Single Product

const getSingleProduct = async (req, res) => {
  const { id: productSlug } = req.params;

  const product = await Product.findOne({ slug: productSlug })
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
    const result = await fileUploadCloud(localFilePath, 800);

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
  /**
   * @type {{
   * categories: string[],
   * }}
   */
  const body = req.body;
  const { categorySlugs } = body;

  if (!categorySlugs || categorySlugs.length === 0) {
    throw new CustomError.BadRequestError("Please provide category slug");
  }

  async function convertCategorySlugsToCategories() {
    let categoriesObjects = [];
    for (let i = 0; i < categorySlugs.length; i++) {
      const category = await Category.findOne({ slug: categorySlugs[i] });
      if (!category) {
        throw new CustomError.NotFoundError(
          `Category with slug: ${categorySlugs[i]} not found`
        );
      }
      categoriesObjects.push(category);
    }
    return categoriesObjects;
  }
  let categoryObjects = await convertCategorySlugsToCategories();

  async function verifyCategoryChain(categoryObjects) {
    if (categoryObjects[0].parentId !== null) {
      throw new CustomError.BadRequestError("Please provide a valid category");
    }
    for (let i = 0; i < categoryObjects.length - 1; i++) {
      if (!categoryObjects[i]._id.equals(categoryObjects[i + 1].parentId)) {
        throw new CustomError.BadRequestError(
          "Please provide a valid category"
        );
      }
    }
  }

  await verifyCategoryChain(categoryObjects);

  let products = [];

  /**
   *
   * @param {any[]} categoryObjects
   */
  async function findProductsByCategory(categoryObjects2) {
    for (let i = 0; i < categoryObjects2.length; i++) {
      const productsFound = await Product.find({
        category: categoryObjects2[i]._id,
      });

      if (productsFound.length) {
        if (categoryObjects !== categoryObjects2) {
          console.log("subcall", productsFound);
        }
        products.push(...productsFound);
      }
    }

    const promisess = categoryObjects2.map(async (category) => {
      const subcategories = await Category.find({ parentId: category._id });
      console.log("subcategories", subcategories);
      await findProductsByCategory(subcategories);
    });
    await Promise.all(promisess);
  }

  await findProductsByCategory(
    categoryObjects.slice(categoryObjects.length - 1)
  );

  if (!products || products.length === 0) {
    throw new CustomError.NotFoundError(`No products found for category`);
  }

  let lastCategory = categoryObjects[categoryObjects.length - 1];
  let subcategories = await Category.find({
    parentId: lastCategory._id,
  });

  console.log("subcategories", subcategories);

  res
    .status(StatusCodes.OK)
    .json({ products, count: products.length, subcategories });
};

// ! Search Products
const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      throw new CustomError.BadRequestError("Please provide a search keyword");
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { "category.name": { $regex: keyword, $options: "i" } },
      ],
    }).populate("category");

    res.status(StatusCodes.OK).json({
      products,
      count: products.length,
      msg:
        products.length === 0
          ? `No products found for the keyword: ${keyword}`
          : undefined,
    });
  } catch (error) {
    throw new CustomError.BadRequestError("Something went wrong !!");
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getSingleProduct,
  uploadImage,
  getProductsByCategory,
  searchProducts,
};
