const express = require("express");
const {
  createOrder,
  getAllOrder,
  getSingleOrder,
  getCurrentUserOrders,
  updateOrder,
} = require("../controllers/orderController");

const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");

const router = express.Router();

router
  .route("/")
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermission("admin"), getAllOrder);

router.route("/showAllMyOrders").get(authenticateUser, getCurrentUserOrders);

router
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

module.exports = router;
