// backend/controllers/productController.js
const Product = require("../models/Product");
const logger = require("../utils/logger");
const { productCreateSchema } = require("../validators/productValidators");
const { ZodError } = require("zod");

// Helper: convert ZodError -> { fieldName: message }
function buildFieldErrorsFromZod(error) {
  const errors = {};
  const issues = error.issues || error.errors || [];

  issues.forEach((issue) => {
    const field = issue.path && issue.path[0]; // e.g. "name", "image", "price"
    if (!field) return;
    // Agar same field ke multiple messages aaye to join kar do
    if (errors[field]) {
      errors[field] = `${errors[field]}, ${issue.message}`;
    } else {
      errors[field] = issue.message;
    }
  });

  return errors;
}

// POST /api/admin/products  (admin only)
exports.createProduct = async (req, res) => {
  try {
    // raw data from body
    const rawData = {
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      price:
        typeof req.body.price === "string"
          ? Number(req.body.price)
          : req.body.price,
    };

    // Zod validation
    const parsed = productCreateSchema.parse(rawData);

    const product = await Product.create(parsed);

    logger.info(
      "Admin %s created product %s (%s)",
      req.user?._id?.toString(),
      product._id.toString(),
      product.name
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = buildFieldErrorsFromZod(error);
      const issues = error.issues || error.errors || [];
      const msg =
        issues.map((e) => e.message).join(", ") || "Validation failed";

      logger.info("Product create validation error: %s", msg);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: fieldErrors, // 🔹 frontend ko proper field-wise errors
      });
    }

    logger.error("Create product error: %s", error.message, {
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /api/products  (public)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    logger.error("Get products error: %s", error.message, {
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// PUT /api/admin/products/:id  (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const rawData = {
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      price:
        typeof req.body.price === "string"
          ? Number(req.body.price)
          : req.body.price,
    };

    // validate with Zod
    const parsed = productCreateSchema.parse(rawData);

    const product = await Product.findByIdAndUpdate(id, parsed, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      logger.info("Update product: not found %s", id);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    logger.info(
      "Admin %s updated product %s (%s)",
      req.user?._id?.toString(),
      product._id.toString(),
      product.name
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = buildFieldErrorsFromZod(error);
      const issues = error.issues || error.errors || [];
      const msg =
        issues.map((e) => e.message).join(", ") || "Validation failed";

      logger.info("Product update validation error: %s", msg);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: fieldErrors,
      });
    }

    logger.error("Update product error: %s", error.message, {
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE /api/admin/products/:id  (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      logger.info("Delete product: not found %s", id);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    logger.info(
      "Admin %s deleted product %s (%s)",
      req.user?._id?.toString(),
      product._id.toString(),
      product.name
    );

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    logger.error("Delete product error: %s", error.message, {
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
