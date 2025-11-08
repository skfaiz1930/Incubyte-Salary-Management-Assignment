/**
 * Structured Logger Configuration
 *
 * Provides application-wide logging using Pino for high-performance structured logs
 * Includes request correlation IDs and contextual metadata
 *
 * @module utils/logger
 */
import pino from 'pino';

/**
 * Configure Pino logger based on environment
 * Development: Pretty-printed logs for readability
 * Production: JSON logs for aggregation and analysis
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
