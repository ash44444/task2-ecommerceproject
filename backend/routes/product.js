// backend/routes/product.js
const express = require("express");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { isAuthenticated, isAdmin } = require("../middlewares/auth");

const router = express.Router();

// Admin create product
router.post("/admin/products", isAuthenticated, isAdmin, createProduct);

// Admin update product
router.put("/admin/products/:id", isAuthenticated, isAdmin, updateProduct);

// Admin delete product
router.delete("/admin/products/:id", isAuthenticated, isAdmin, deleteProduct);

// Public get all products
router.get("/products", getProducts);

module.exports = router;
