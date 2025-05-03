const express = require("express");
const { googleLogin, logout } = require("../controllers/authController");

const router = express.Router();

router.post("/google-login", googleLogin);
router.get("/logout", logout);

module.exports = router;
