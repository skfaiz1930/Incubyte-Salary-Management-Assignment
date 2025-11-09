/**
 * Error Handling Middleware
 *
 * Global error handler for Express
 * Catches all errors, logs them, and returns consistent JSON responses
 * Never exposes internal error details to clients in production
 *
 * @module middleware/error
 */
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

/**
 * Global error handling middleware
 * Must be registered AFTER all routes
 *
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param _next - Express next function (unused but required for signature)
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error with request context
  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
    },
  });

  // Handle known operational errors
  if (
    err instanceof AppError ||
    (err as any).name === 'AppError' ||
    (err as any).name === 'NotFoundError'
  ) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Handle unexpected errors
  // Never expose internal error details in production
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal server error';

  res.status(500).json({
    status: 'error',
    message,
  });
};

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.path || req.url || req.originalUrl} not found`,
  });
};
