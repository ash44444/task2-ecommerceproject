// backend/validators/productValidators.js
const { z } = require("zod");

/**
 * PRODUCT NAME – ecommerce style
 * - 2–120 chars
 * - Allows:
 *   - Letters (A–Z, a–z, unicode)
 *   - Numbers (for models: "iPhone 15", "RTX 4090")
 *   - Spaces
 *   - Dot .  (e.g., "U.S. Polo")
 *   - Comma ,  (e.g., "Boat, Ltd.")
 *   - Apostrophe '  (e.g., "Levi's")
 *   - Hyphen -  (e.g., "Noise-Cancelling")
 *   - Ampersand &  (e.g., "Marks & Spencer")
 *   - Brackets ()  (e.g., "T-Shirt (Men)")
 *   - Slash /  (e.g., "USB-C/Lightning")
 * - ❌ Pure numbers NOT allowed ("123456" invalid)
 * - ✅ Must contain at least one letter
 * - Extra spaces collapse to single
 */
const productNameSchema = z
  .string({
    required_error: "Product name is required",
    invalid_type_error: "Product name must be a string",
  })
  .trim()
  .min(2, "Product name must be at least 2 characters")
  .max(120, "Product name must be at most 120 characters")
  .regex(
    /^[A-Za-z0-9À-ÖØ-öø-ÿ .,'\-&()/_]+$/,
    "Product name contains invalid characters"
  )
  .refine((v) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(v), {
    message: "Product name must contain at least one letter",
  })
  .transform((v) => v.replace(/\s+/g, " ")); // multiple spaces → single

/**
 * DESCRIPTION
 * - 5–500 chars
 * - Free text, but trimmed and extra spaces collapsed
 */
const descriptionSchema = z
  .string({
    required_error: "Description is required",
    invalid_type_error: "Description must be a string",
  })
  .trim()
  .min(5, "Description must be at least 5 characters")
  .max(500, "Description must be at most 500 characters")
  .transform((v) => v.replace(/\s+/g, " "));

/**
 * PRICE
 * - Number > 0
 * - Upper limit just to catch crazy values (e.g. 1 crore)
 *   -> max 1,00,00,000 (1e8)
 * NOTE:
 *  Tum already controller me string → Number convert kar rahe ho,
 *  isliye yahan plain number hi rakha gaya hai.
 */
const priceSchema = z
  .number({
    required_error: "Price is required",
    invalid_type_error: "Price must be a number",
  })
  .gt(0, "Price must be greater than 0")
  .max(1e8, "Price seems too high");

/**
 * IMAGE URL
 * - Must be valid URL
 * - Must start with http / https
 * - Must look like image (jpg, jpeg, png, webp, gif, avif)
 */
const imageUrlSchema = z
  .string({
    required_error: "Product image URL is required",
    invalid_type_error: "Image URL must be a string",
  })
  .trim()
  .url("Please provide a valid image URL")
  .refine((v) => /^https?:\/\//.test(v), {
    message: "Image URL must start with http or https",
  })
  .refine(
    (v) =>
      /\.(jpg|jpeg|png|webp|gif|avif)(\?|#|$)/i.test(v),
    {
      message: "Image URL must point to an image (jpg, jpeg, png, webp, gif, avif)",
    }
  );

exports.productCreateSchema = z.object({
  name: productNameSchema,
  price: priceSchema,
  description: descriptionSchema,
  image: imageUrlSchema,
});
