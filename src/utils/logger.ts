/**
 * Structured Logger Configuration
 *
 * Provides application-wide logging using Pino for high-performance structured logs
 * Includes request correlation IDs and contextual metadata
 *
 * @module utils/logger
 */
import path from 'path';
import pino from 'pino';
import fs from 'fs';

/**
 * Configure Pino logger based on environment
 * Development: Pretty-printed logs for readability
 * Production: JSON logs for aggregation and analysis
 */
// Set log file path
const logFilePath = path.join(__dirname, '..', 'logs', 'app.log');

// Create the 'logs' directory if it doesn't exist
if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : {
          target: 'pino/file', // Use file target for production logs
          options: {
            destination: logFilePath, // Specify the log file path
          },
        },
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
