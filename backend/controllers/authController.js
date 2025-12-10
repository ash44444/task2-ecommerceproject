// backend/controllers/authController.js
const User = require("../models/User");
const logger = require("../utils/logger");
const { registerSchema, loginSchema } = require("../validators/authValidators");
const { ZodError } = require("zod");

// Helper: convert Zod issues -> { field: "msg, msg2" }
function zodIssuesToFieldErrors(issues = []) {
  const fieldErrors = {};

  for (const issue of issues) {
    const field = issue.path && issue.path.length > 0 ? issue.path[0] : "_global";

    if (!fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    } else {
      fieldErrors[field] += ", " + issue.message;
    }
  }

  return fieldErrors;
}

// REGISTER (SIGNUP)
exports.register = async (req, res) => {
  try {
    // 1) Zod validation (body clean + validate)
    const parsedData = registerSchema.parse(req.body);
    const { name, email, password } = parsedData;

    // 2) Check if user already exists
    const existing = await User.findOne({ email });

    if (existing) {
      logger.info("Register attempt with existing email: %s", email);
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
        errors: { email: "User already exists with this email" },
      });
    }

    // 3) Create user
    const user = await User.create({ name, email, password });

    // 4) Generate JWT + cookie
    const token = user.generateToken();

    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    logger.info("New user registered: %s (%s)", user._id.toString(), email);

    res
      .status(201)
      .cookie("token", token, options)
      .json({
        success: true,
        message: "User registered successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      });
  } catch (error) {
    // Zod validation error
    if (error instanceof ZodError) {
      const issues = error.issues || error.errors || [];
      const fieldErrors = zodIssuesToFieldErrors(issues);

      logger.info("Register validation error: %o", fieldErrors);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: fieldErrors,
      });
    }

    // Any other server error
    logger.error("Register error: %s", error.message, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// LOGIN (SIGNIN)
exports.login = async (req, res) => {
  try {
    // 1) Zod validation
    const parsedData = loginSchema.parse(req.body);
    const { email, password } = parsedData;

    // 2) Find user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      logger.info("Login failed - user not found: %s", email);
      return res.status(400).json({
        success: false,
        message: "User does not exist",
        errors: { email: "User does not exist" },
      });
    }

    // 3) Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      logger.info("Login failed - incorrect password for: %s", email);
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
        errors: { password: "Incorrect password" },
      });
    }

    // 4) Generate JWT + cookie
    const token = user.generateToken();

    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    logger.info("User logged in: %s (%s)", user._id.toString(), email);

    res
      .status(200)
      .cookie("token", token, options)
      .json({
        success: true,
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      });
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues || error.errors || [];
      const fieldErrors = zodIssuesToFieldErrors(issues);

      logger.info("Login validation error: %o", fieldErrors);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: fieldErrors,
      });
    }

    logger.error("Login error: %s", error.message, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    logger.error("Logout error: %s", error.message, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// MY PROFILE
exports.myProfile = async (req, res) => {
  try {
    const user = req.user; // isAuthenticated middleware se set hua

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error("MyProfile error: %s", error.message, {
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
