// backend/controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const logger = require("../utils/logger");
const { orderCheckoutSchema } = require("../validators/orderValidators");
const { ZodError } = require("zod");

// POST /api/orders/checkout
// Body: { items: [{ productId, quantity }], shipping: { ... } }
exports.checkout = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // 🔹 ZOD VALIDATION (body clean + validate)
    const parsed = orderCheckoutSchema.parse(req.body);
    const { items, shipping } = parsed;

    let totalAmount = 0;
    const orderItems = [];

    // Build order items from DB products
    for (const item of items) {
      const { productId, quantity } = item;

      const product = await Product.findById(productId);
      if (!product) {
        logger.info("Checkout: product not found %s", productId);
        continue;
      }

      const lineTotal = product.price * quantity;
      totalAmount += lineTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products found for this order",
      });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shipping,
    });

    logger.info(
      "Order %s created for user %s (items: %d, total: %d)",
      order._id.toString(),
      userId.toString(),
      orderItems.length,
      totalAmount
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    // 🔹 Zod validation error
    if (error instanceof ZodError) {
      const issues = error.issues || error.errors || [];

      // 👉 field-wise errors bana rahe hain
      const fieldErrors = {};
      for (const issue of issues) {
        // e.g. ["shipping", "fullName"] → "shipping.fullName"
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      }

      logger.info("Checkout validation error: %o", fieldErrors);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: fieldErrors,   // 🔴 IMPORTANT
      });
    }

    logger.error("Checkout error: %s", error.message, {
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Server error while placing order",
    });
  }
};
