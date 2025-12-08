// backend/validators/orderValidators.js
const { z } = require("zod");

// Simple MongoDB ObjectId regex
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * ORDER ITEM
 * - productId: Mongo ObjectId string
 * - quantity: integer >= 1
 */
const orderItemSchema = z.object({
  productId: z
    .string({
      required_error: "Product id is required",
      invalid_type_error: "Product id must be a string",
    })
    .regex(objectIdRegex, "Invalid product id"),

  quantity: z
    .coerce
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),
});

/**
 * FULL NAME – ecommerce style
 * - 2–80 chars
 * - Letters + spaces + . , ' -
 * - At least 1 letter (pure numbers NOT allowed)
 * - Multiple spaces collapse to single
 */
const fullNameSchema = z
  .string({
    required_error: "Full name is required",
    invalid_type_error: "Full name must be a string",
  })
  .trim()
  .min(2, "Full name must be at least 2 characters")
  .max(80, "Full name must be at most 80 characters")
  .regex(
    /^[A-Za-zÀ-ÖØ-öø-ÿ .,'\-]+$/,
    "Full name can only contain letters, spaces, dots, commas, apostrophes and hyphens"
  )
  .refine((v) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(v), {
    message: "Full name must contain at least one letter",
  })
  .transform((v) => v.replace(/\s+/g, " ")); // collapse multiple spaces

/**
 * PHONE – typical ecommerce
 * - Allows digits, spaces, +, -, ()
 * - Total length 10–20 characters
 * - Must contain 10–15 digits
 */
const phoneSchema = z
  .string({
    required_error: "Phone is required",
    invalid_type_error: "Phone must be a string",
  })
  .trim()
  .regex(
    /^[0-9+\-() ]{10,20}$/,
    "Phone can contain digits, spaces, +, -, () and must be 10–20 characters"
  )
  .refine((v) => {
    const digits = (v.match(/\d/g) || []).length;
    return digits >= 10 && digits <= 15;
  }, {
    message: "Phone must contain 10–15 digits",
  });

/**
 * CITY – letters only (with spaces, dot, hyphen)
 */
const citySchema = z
  .string({
    required_error: "City is required",
    invalid_type_error: "City must be a string",
  })
  .trim()
  .min(2, "City must be at least 2 characters")
  .max(80, "City must be at most 80 characters")
  .regex(
    /^[A-Za-zÀ-ÖØ-öø-ÿ .'-]+$/,
    "City can only contain letters, spaces, dots, apostrophes and hyphens"
  )
  .refine((v) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(v), {
    message: "City must contain at least one letter",
  })
  .transform((v) => v.replace(/\s+/g, " "));

/**
 * PINCODE – Indian ecommerce style
 * - Exactly 6 digits, not starting with 0
 * (agar generic chahiye to comment out regex and sirf min/max use kar sakte ho)
 */
const pincodeSchema = z
  .string({
    required_error: "Pincode is required",
    invalid_type_error: "Pincode must be a string",
  })
  .trim()
  .regex(/^[1-9][0-9]{5}$/, "Pincode must be a valid 6-digit code");

/**
 * ADDRESS – free text but with sensible length
 */
const addressSchema = z
  .string({
    required_error: "Address is required",
    invalid_type_error: "Address must be a string",
  })
  .trim()
  .min(5, "Address must be at least 5 characters")
  .max(200, "Address must be at most 200 characters")
  .transform((v) => v.replace(/\s+/g, " "));

/**
 * SHIPPING INFO
 */
const shippingSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  city: citySchema,
  pincode: pincodeSchema,
  addressLine: addressSchema,
});

/**
 * ORDER CHECKOUT SCHEMA
 * Body:
 * {
 *   items: [{ productId, quantity }],
 *   shipping: { fullName, phone, city, pincode, addressLine }
 * }
 */
exports.orderCheckoutSchema = z.object({
  items: z
    .array(orderItemSchema, {
      invalid_type_error: "Items must be an array",
    })
    .min(1, "Order must contain at least one item"),

  shipping: shippingSchema,
});
