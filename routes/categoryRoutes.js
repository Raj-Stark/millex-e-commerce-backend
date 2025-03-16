const express = require("express");
const {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");
const { handleFileUpload } = require("../utils/cloudinaryUpload");
const { uploadImage } = require("../controllers/productController");

const router = express.Router();

router
  .route("/:parentSlug?")
  .get(getAllCategory)
  .post([authenticateUser, authorizePermission("admin")], createCategory);

router
  .route("/uploadImage")
  .post(
    [authenticateUser, authorizePermission("admin"), handleFileUpload],
    uploadImage
  );
router
  .route("/:id")
  .patch([authenticateUser, authorizePermission("admin")], updateCategory)
  .delete([authenticateUser, authorizePermission("admin")], deleteCategory);

module.exports = router;
