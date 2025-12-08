// backend/utils/logger.js
const fs = require("fs");
const path = require("path");
const { createLogger, format, transports } = require("winston");

// Detect if running on Vercel (serverless)
const isVercel = !!process.env.VERCEL;

// Common log format
const logFormat = format.printf(({ level, message, timestamp, stack }) => {
  return stack
    ? `[${timestamp}] ${level}: ${message}\n${stack}`
    : `[${timestamp}] ${level}: ${message}`;
});

// Always use Console logging (Vercel supports this)
const loggerTransports = [
  new transports.Console({
    format: format.combine(format.colorize(), logFormat),
  }),
];

// Only create log files if NOT on Vercel
if (!isVercel) {
  const logDir = path.join(__dirname, "..", "logs");

  // Create logs folder if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  loggerTransports.push(
    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new transports.File({
      filename: path.join(logDir, "combined.log"),
    })
  );
}

// Create logger
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: loggerTransports,
});

// For morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
