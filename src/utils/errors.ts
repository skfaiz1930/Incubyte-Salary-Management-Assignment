/**
 * Custom Error Classes
 *
 * Defines application-specific errors with HTTP status codes
 * All errors extend AppError for consistent handling
 *
 * @module utils/errors
 */

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found Error
 * Used when a requested resource does not exist
 *
 * @example
 * throw new NotFoundError('Employee', 123);
 * // Returns: "Employee with id 123 not found"
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id: string | number) {
    super(404, `${resource} with id ${id} not found`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 400 Validation Error
 * Used when request data fails validation rules
 *
 * @example
 * throw new ValidationError('Email format is invalid');
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 409 Conflict Error
 * Used when request conflicts with existing data
 *
 * @example
 * throw new ConflictError('Email already exists');
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 500 Internal Server Error
 * Used for unexpected server errors
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(500, message, false);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
