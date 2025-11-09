/**
 * HTTP Request Logger Middleware
 *
 * Logs all HTTP requests with correlation IDs and timing information
 * Uses Pino for high-performance structured logging
 *
 * @module middleware/logger
 */
import pinoHttp from 'pino-http';
import logger from '../utils/logger';

/**
 * HTTP logger middleware
 * Automatically logs all requests and responses with:
 * - Request method, URL, headers
 * - Response status code, time
 * - Unique request ID for correlation
 */
export const httpLogger = pinoHttp({
  logger,
  autoLogging: true,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    }
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },
  customSuccessMessage: (_req, res) => {
    return `${_req.method} ${_req.url} completed with ${res.statusCode}`;
  },
  customErrorMessage: (_req, res, err) => {
    return `${_req.method} ${_req.url} failed with ${res.statusCode}: ${err.message}`;
  },
});
