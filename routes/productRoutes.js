const express = require("express");
const {
  getAllProduct,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getProductsByCategory,
  searchProducts,
  getRelatedProducts,
} = require("../controllers/productController");

const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");
const { handleFileUpload } = require("../utils/cloudinaryUpload");

const router = express.Router();

router
  .route("/")
  .get(getAllProduct)
  .post([authenticateUser, authorizePermission("admin")], createProduct);

router
  .route("/uploadImage")
  .post(
    [authenticateUser, authorizePermission("admin"), handleFileUpload],
    uploadImage
  );

router.route("/filter").post(getProductsByCategory);
router.route("/searchProducts").get(searchProducts);
router
  .route("/:id")
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermission("admin")], updateProduct)
  .delete([authenticateUser, authorizePermission("admin")], deleteProduct);

router.get("/related/:slug", getRelatedProducts);

module.exports = router;
