const express = require("express");
const {
  createReview,
  getAllReview,
  getSingleReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");

const router = express.Router();

router.route("/").post(authenticateUser, createReview).get(getAllReview);

router
  .route("/:id")
  .patch(authenticateUser, updateReview)
  .delete([authenticateUser, authorizePermission("admin")], deleteReview);

module.exports = router;
