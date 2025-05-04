const express = require("express");
const router = express.Router();
const {
  googleLogin,
  googleLoginAdmin,
  logout,
} = require("../controllers/authController");

router.post("/google-login", googleLogin); // public
router.post("/admin/google-login", googleLoginAdmin); // admin-only
router.get("/logout", logout);

module.exports = router;
