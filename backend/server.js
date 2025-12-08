// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const logger = require("./utils/logger");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/order");
const productRoutes = require("./routes/product");

const app = express();

const PORT = process.env.PORT || 5000;

// ------------------- BASIC SECURITY -------------------
app.disable("x-powered-by");
app.use(helmet());

// ------------------- BODY PARSER (must be before sanitize) -------------------
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// ------------------- SANITIZERS (after body parser) -------------------
app.use(
  mongoSanitize({
    replaceWith: "_" // optional: helps testing
  })
);

app.use(xss());

// ------------------- HTTP PARAMETER POLLUTION -------------------
app.use(hpp());

// ------------------- CORS -------------------
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ------------------- RATE LIMIT -------------------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Try again later.",
  },
});
app.use("/api", apiLimiter);

// ------------------- LOGGER -------------------
app.use(
  morgan("combined", {
    stream: logger.stream,
  })
);

// ------------------- TEST SECURITY ROUTE -------------------
// app.post("/api/test-security", (req, res) => {
//   console.log("BODY RECEIVED =", req.body);
//   console.log("QUERY RECEIVED =", req.query);

//   return res.json({
//     success: true,
//     body: req.body,
//     query: req.query,
//   });
// });

// ------------------- ROUTES -------------------
app.get("/", (req, res) => {
  res.send("Ecommerce Auth Backend Running");
});

app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);

// ------------------- GLOBAL ERROR HANDLER -------------------
app.use((err, req, res, next) => {
  logger.error("Unhandled error: %s", err.message, { stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ------------------- DB + SERVER -------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info(" MongoDB connected");
    app.listen(PORT, () => {
      logger.info(` Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error: %s", err.message);
    process.exit(1);
  });
