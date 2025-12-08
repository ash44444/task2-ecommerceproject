// backend/validators/authValidators.js
const { z } = require("zod");

/**
 * Common trimmed string
 */
const trimmedString = z
  .string({
    required_error: "Field is required",
    invalid_type_error: "Field must be a string",
  })
  .trim();

/**
 * NAME (user full name, ecommerce-style)
 * - 2–80 characters
 * - Allows:
 *   - Letters (A–Z, a–z, unicode)
 *   - Spaces
 *   - Dot .  (Dr. Strange)
 *   - Apostrophe '  (O'Connor)
 *   - Hyphen -  (Jean-Pierre)
 *   - Comma ,  (ACME, Inc.)
 * - ❌ Pure numbers NOT allowed (e.g. "51545645644" invalid)
 * - ✅ Must contain at least one letter
 */
const nameSchema = trimmedString
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name must be at most 80 characters")
  .regex(
    /^[A-Za-zÀ-ÖØ-öø-ÿ .,'\-]+$/,
    "Name can only contain letters, spaces, dots, commas, apostrophes and hyphens"
  )
  .refine((v) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(v), {
    message: "Name must contain at least one letter",
  })
  .transform((name) => name.replace(/\s+/g, " ")); // collapse multiple spaces

/**
 * EMAIL
 */
const emailSchema = trimmedString
  .max(254, "Email must be at most 254 characters")
  .email("Please provide a valid email address")
  .transform((email) => email.toLowerCase());

/**
 * PASSWORD STRONG (for register/change)
 * - 8–64 chars
 * - No spaces
 * - 1 lowercase, 1 uppercase, 1 digit, 1 special char
 */
const passwordStrongSchema = z
  .string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  })
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be at most 64 characters")
  .refine((v) => !/\s/.test(v), {
    message: "Password must not contain spaces",
  })
  .refine((v) => /[a-z]/.test(v), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((v) => /[A-Z]/.test(v), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((v) => /[0-9]/.test(v), {
    message: "Password must contain at least one digit",
  })
  .refine((v) => /[^A-Za-z0-9]/.test(v), {
    message: "Password must contain at least one special character",
  });

/**
 * PASSWORD LOGIN (simple, industry style)
 */
const passwordLoginSchema = z
  .string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  })
  .min(1, "Password is required")
  .max(128, "Password is too long");

/**
 * REGISTER SCHEMA
 */
exports.registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordStrongSchema,
});

/**
 * LOGIN SCHEMA
 */
exports.loginSchema = z.object({
  email: emailSchema,
  password: passwordLoginSchema,
});
