const winston = require('winston');

// Create a custom log level for success
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    success: 3,
};
// Define custom colors
const colors = {
    success: 'green',
    error: 'red',
    info: 'blue',
};

// Add custom colors to winston
winston.addColors(colors);

// Create a custom format for success
const customFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
);

// Create a logger instance
const logger = winston.createLogger({
    levels,
    format: winston.format.combine(
        winston.format.timestamp(), // Add timestamp
        winston.format.colorize(),  // Apply colors
        customFormat               // Custom format with timestamp
    ),
    transports: [
        new winston.transports.Console(),
    //   new winston.transports.Console({
    //     level: 'info', // Set the minimum level to capture
    //     format: winston.format.combine(
    //       winston.format.colorize(),
    //       winston.format.simple()
    //     ),
    //   }),
    //   new winston.transports.File({
    //     filename: 'combined.log',
    //     level: 'info', // Set the minimum level to capture
    //     format: winston.format.json(),
    //   }),
    ],
});

module.exports = logger;