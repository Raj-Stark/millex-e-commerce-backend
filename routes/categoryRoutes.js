const express = require("express");
const {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const { uploadImage } = require("../controllers/productController");

const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");

const { handleFileUpload } = require("../utils/cloudinaryUpload");

const router = express.Router();

// 📌 Upload category image (reusing uploadImage from productController)
router.post(
  "/upload-image",
  [authenticateUser, authorizePermission("admin"), handleFileUpload],
  uploadImage
);

// 📌 Create top-level category or get all top-level categories
router
  .route("/")
  .get(getAllCategory)
  .post([authenticateUser, authorizePermission("admin")], createCategory);

// 📌 Create or get subcategories under a parentSlug
router
  .route("/parent/:parentSlug")
  .get(getAllCategory)
  .post([authenticateUser, authorizePermission("admin")], createCategory);

// 📌 Update or delete by category ID
router
  .route("/:id")
  .patch([authenticateUser, authorizePermission("admin")], updateCategory)
  .delete([authenticateUser, authorizePermission("admin")], deleteCategory);

module.exports = router;
