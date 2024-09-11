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

// Custom format to handle arrays and objects
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
    // Process message which might be a string, object, or array
    let formattedMessage = '';

    if (Array.isArray(message)) {
        // Handle array of messages
        formattedMessage = message.map(part =>
        typeof part === 'object' ? JSON.stringify(part, null, 2) : part
        ).join(' ');
    } else if (typeof message === 'object') {
        // Handle single object message
        formattedMessage = JSON.stringify(message, null, 2);
    } else {
        // Handle plain text message
        formattedMessage = message;
    }

    return `${timestamp} [${level}]: ${formattedMessage}`;
});

// Create a logger instance
const logger = winston.createLogger({
    levels,
    format: winston.format.combine(
        winston.format.timestamp(), // Add timestamp
        winston.format.colorize(),  // Apply colors
        customFormat               // Custom format with timestamp and object/array handling
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(), // Ensure colors are applied
                customFormat               // Custom format for console output
            )
        })
    ]
});

module.exports = logger;