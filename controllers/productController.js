const { fileUploadCloud } = require("../utils/cloudinaryUpload");
const CustomError = require("../errors");
const path = require("path");
const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const Category = require("../models/Category");

// ! Create Product
const createProduct = async (req, res) => {
  const { categoryId, subCategoryId, ...rest } = req.body;

  if (!categoryId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide categoryId" });
  }

  // ✅ Validate category existence
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new CustomError.NotFoundError(
      `Category not found with ID: ${categoryId}`
    );
  }

  // ✅ Validate subcategory if provided
  if (subCategoryId) {
    const subcategory = await Category.findById(subCategoryId);
    if (!subcategory) {
      throw new CustomError.NotFoundError(
        `Subcategory not found with ID: ${subCategoryId}`
      );
    }

    if (!subcategory.parentId || !subcategory.parentId.equals(categoryId)) {
      throw new CustomError.BadRequestError(
        "Subcategory must belong to the selected category"
      );
    }
  }

  // ✅ Create product using correct schema field: `subcategory`
  const product = await Product.create({
    ...rest,
    category: categoryId,
    subcategory: subCategoryId || null,
  });

  res.status(StatusCodes.CREATED).json({ product });
};

// ! Update Product
const updateProduct = async (req, res) => {
  const { categoryId, subCategoryId, ...rest } = req.body;

  // ✅ Validate subcategory only if both are provided
  if (subCategoryId && categoryId) {
    const subcategory = await Category.findById(subCategoryId);
    if (!subcategory) {
      throw new CustomError.NotFoundError(
        `Subcategory not found with ID: ${subCategoryId}`
      );
    }

    if (!subcategory.parentId || !subcategory.parentId.equals(categoryId)) {
      throw new CustomError.BadRequestError(
        "Subcategory must belong to the selected category"
      );
    }
  }

  // ✅ Update product using correct schema field: 'subcategory'
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    {
      ...rest,
      ...(categoryId !== undefined && { category: categoryId }),
      ...(subCategoryId !== undefined && { subcategory: subCategoryId }),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    throw new CustomError.NotFoundError(`No product with ID: ${req.params.id}`);
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
  const products = await Product.find({})
    .populate("category")
    .populate("subcategory");

  res.status(StatusCodes.OK).json({ products, count: products.length });
};

// ! Get Single Product

const getSingleProduct = async (req, res) => {
  const { id: productSlug } = req.params;

  const product = await Product.findOne({ slug: productSlug })
    .populate("category")
    .populate("subcategory")
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
  const { categorySlugs } = req.body;

  if (!categorySlugs || categorySlugs.length === 0) {
    throw new CustomError.BadRequestError("Please provide category slug(s)");
  }

  // Convert slugs to category documents
  const categoryObjects = await Promise.all(
    categorySlugs.map(async (slug) => {
      const category = await Category.findOne({ slug });
      if (!category) {
        throw new CustomError.NotFoundError(
          `Category with slug: ${slug} not found`
        );
      }
      return category;
    })
  );

  // ✅ Validate parent-child nesting only if multiple slugs are provided
  if (categoryObjects.length > 1) {
    if (categoryObjects[0].parentId !== null) {
      throw new CustomError.BadRequestError(
        "First slug must be a top-level category"
      );
    }

    for (let i = 0; i < categoryObjects.length - 1; i++) {
      const parent = categoryObjects[i];
      const child = categoryObjects[i + 1];

      if (!child.parentId?.equals(parent._id)) {
        throw new CustomError.BadRequestError(
          "Invalid category nesting in slugs"
        );
      }
    }
  }

  const lastCategory = categoryObjects[categoryObjects.length - 1];
  const products = [];

  // ✅ Recursively find products in the category and its children
  const findProductsByCategory = async (categories) => {
    for (const cat of categories) {
      const found = await Product.find({
        $or: [{ category: cat._id }, { subcategory: cat._id }],
      });

      if (found.length > 0) {
        products.push(...found);
      }

      const children = await Category.find({ parentId: cat._id });
      if (children.length > 0) {
        await findProductsByCategory(children);
      }
    }
  };

  await findProductsByCategory([lastCategory]);

  if (!products.length) {
    throw new CustomError.NotFoundError("No products found for this category");
  }

  const subcategories = await Category.find({ parentId: lastCategory._id });

  return res.status(StatusCodes.OK).json({
    products,
    count: products.length,
    subcategories,
  });
};

// ! Search Products
const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      throw new CustomError.BadRequestError("Please provide a search keyword");
    }

    // Step 1: Find products by name or description
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    })
      .populate("category")
      .populate("subcategory");

    // Step 2: Filter also by populated category/subcategory names
    const keywordLower = keyword.toLowerCase();

    const filtered = products.filter((p) => {
      return (
        p.name.toLowerCase().includes(keywordLower) ||
        p.description.toLowerCase().includes(keywordLower) ||
        p.category?.name?.toLowerCase().includes(keywordLower) ||
        p.subcategory?.name?.toLowerCase().includes(keywordLower)
      );
    });

    res.status(StatusCodes.OK).json({
      products: filtered,
      count: filtered.length,
      msg:
        filtered.length === 0
          ? `No products found for the keyword: ${keyword}`
          : undefined,
    });
  } catch (error) {
    throw new CustomError.BadRequestError("Something went wrong !!");
  }
};

function escapeRegex(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const getRelatedProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const currentProduct = await Product.findOne({ slug });

    if (!currentProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const keywords = currentProduct.name.split(" ").filter(Boolean);

    if (keywords.length === 0) {
      return res.status(200).json({ relatedProducts: [] });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: currentProduct._id },
      $or: keywords.map((word) => ({
        name: { $regex: escapeRegex(word), $options: "i" },
      })),
    })
      .limit(10)
      .select("name slug price images category subcategory")
      .lean();

    res.status(200).json({ relatedProducts });
  } catch (error) {
    console.error("Related product fetch error:", error);
    res.status(500).json({ error: "Server error" });
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
  getRelatedProducts,
};
