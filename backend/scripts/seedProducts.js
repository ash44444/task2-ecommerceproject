// backend/scripts/seedProducts.js

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { products } = require("../data/productsData");

// 🔹 Connect MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "ecommerce_demo",
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

async function seedProducts() {
  await connectDB();

  try {
    await Product.deleteMany({});
    console.log("🗑 Old products deleted");

    await Product.insertMany(products);
    console.log("🚀 Products inserted successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
}

seedProducts();
