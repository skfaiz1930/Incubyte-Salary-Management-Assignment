/**
 * Validation Middleware
 *
 * Zod-based validation middleware for Express routes
 * Validates request body, params, and query against schemas
 *
 * @module middleware/validation
 */
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Validation middleware factory
 *
 * Creates middleware that validates incoming requests against a Zod schema
 * Validates body, params, and query simultaneously
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * @example
 * router.post('/employees',
 *   validate(createEmployeeSchema),
 *   employeeController.create
 * );
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate all request parts simultaneously
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data (includes transformations)
      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors into user-friendly messages
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors,
        });
        return;
      }

      // Pass unexpected errors to error handler
      next(error);
    }
  };
};
