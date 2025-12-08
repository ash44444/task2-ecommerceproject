const express = require("express");
const { checkout } = require("../controllers/orderController");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

// POST /api/orders/checkout
router.post("/orders/checkout", isAuthenticated, checkout);

module.exports = router;

