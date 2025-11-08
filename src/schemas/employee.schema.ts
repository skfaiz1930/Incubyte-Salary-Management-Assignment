/**
 * Employee Validation Schemas
 *
 * Zod schemas for runtime validation of employee data
 * Enforces business rules at API boundaries
 *
 * @module schemas/employee
 */
import { z } from 'zod';

/**
 * Supported country codes
 */
const COUNTRY_CODES = ['US', 'UK', 'IN', 'CA'] as const;

/**
 * Minimum and maximum salary limits (in cents)
 * Min: $0, Max: $10 billion
 */
const MIN_SALARY_CENTS = 0;
const MAX_SALARY_CENTS = 1000000000000; // 10 billion dollars in cents

/**
 * Schema for creating a new employee
 */
export const createEmployeeSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters')
      .trim(),
    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .max(255, 'Email must be at most 255 characters'),
    jobTitle: z
      .string()
      .min(2, 'Job title must be at least 2 characters')
      .max(100, 'Job title must be at most 100 characters')
      .trim(),
    country: z.enum(COUNTRY_CODES, {
      errorMap: () => ({ message: `Country must be one of: ${COUNTRY_CODES.join(', ')}` }),
    }),
    grossSalaryCents: z
      .number()
      .int('Salary must be an integer (cents)')
      .min(MIN_SALARY_CENTS, 'Salary cannot be negative')
      .max(MAX_SALARY_CENTS, 'Salary exceeds maximum allowed value'),
  }),
});

/**
 * Schema for updating an existing employee
 * All fields are optional
 */
export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Employee ID must be a positive integer'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .max(255, 'Email must be at most 255 characters')
      .optional(),
    jobTitle: z
      .string()
      .min(2, 'Job title must be at least 2 characters')
      .max(100, 'Job title must be at most 100 characters')
      .trim()
      .optional(),
    country: z
      .enum(COUNTRY_CODES, {
        errorMap: () => ({ message: `Country must be one of: ${COUNTRY_CODES.join(', ')}` }),
      })
      .optional(),
    grossSalaryCents: z
      .number()
      .int('Salary must be an integer (cents)')
      .min(MIN_SALARY_CENTS, 'Salary cannot be negative')
      .max(MAX_SALARY_CENTS, 'Salary exceeds maximum allowed value')
      .optional(),
  }),
});

/**
 * Schema for employee ID parameter
 */
export const employeeIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Employee ID must be a positive integer'),
  }),
});

/**
 * Schema for pagination query parameters
 */
export const paginationSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a positive integer')
      .optional()
      .default('1')
      .transform(Number),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .optional()
      .default('10')
      .transform(Number)
      .refine((val) => val <= 100, 'Limit cannot exceed 100'),
    country: z
      .enum(COUNTRY_CODES, {
        errorMap: () => ({ message: `Country must be one of: ${COUNTRY_CODES.join(', ')}` }),
      })
      .optional(),
    jobTitle: z.string().max(100).trim().optional(),
  }),
});

/**
 * Type inference for validated data
 */
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>['body'];
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>['body'];
export type EmployeeIdInput = z.infer<typeof employeeIdSchema>['params'];
export type PaginationInput = z.infer<typeof paginationSchema>['query'];
