// backend/routes/auth.js
const express = require("express");
const {
  register,
  login,
  logout,
  myProfile
} = require("../controllers/authController");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

// POST /api/auth/register
router.post("/auth/register", register);

// POST /api/auth/login
router.post("/auth/login", login);

// GET /api/auth/logout
router.get("/auth/logout", logout);

// GET /api/auth/me
router.get("/auth/me", isAuthenticated, myProfile);

module.exports = router;
