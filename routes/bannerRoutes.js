const express = require("express");
const { createBanner, getBanner } = require("../controllers/bannerController");
const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");
const { handleFileUpload } = require("../utils/cloudinaryUpload");

const router = express.Router();

router
  .route("/")
  .post(
    [authenticateUser, authorizePermission("admin"), handleFileUpload],
    createBanner
  )
  .get(getBanner);

module.exports = router;
