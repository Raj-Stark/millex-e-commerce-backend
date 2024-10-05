const express = require("express");
const {
  getAllUser,
  getCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");
const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");

const router = express.Router();

router
  .route("/")
  .get(authenticateUser, authorizePermission("admin"), getAllUser);

router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").post(authenticateUser, updateUserPassword);
router.route("/getCurrentUser").get(authenticateUser, getCurrentUser);

module.exports = router;
