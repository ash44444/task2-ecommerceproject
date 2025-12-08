// backend/models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price must be positive"],
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Please provide product image URL"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
