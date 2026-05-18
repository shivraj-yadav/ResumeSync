const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  signup,
  login,
  logout,
  checkUsername,
  getMe,
} = require("../controllers/authController");

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-username", checkUsername);

// Protected routes
router.get("/me", authMiddleware, getMe);

module.exports = router;
