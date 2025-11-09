/**
 * Employee Domain Model
 *
 * Core domain entity representing an employee
 * All salary amounts are stored as integer cents to avoid floating-point precision issues
 *
 * @module models/employee
 */

/**
 * Supported country codes (ISO 3166-1 alpha-2)
 */
export type CountryCode = 'US' | 'UK' | 'IN' | 'CA' | 'XX';

/**
 * Database row representation
 * Maps directly to the employees table schema
 */
export interface EmployeeRow {
  id: number;
  name: string;
  email: string;
  job_title: string;
  country: CountryCode;
  gross_salary_cents: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

/**
 * Domain model for employee
 * Uses camelCase for application layer
 */
export interface Employee {
  id: number;
  name: string;
  email: string;
  jobTitle: string;
  country: CountryCode;
  grossSalaryCents: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Data for creating a new employee
 * Excludes auto-generated fields (id, timestamps)
 */
export interface CreateEmployeeData {
  name: string;
  email: string;
  jobTitle: string;
  country: CountryCode;
  grossSalaryCents: number;
}

/**
 * Data for updating an existing employee
 * All fields are optional
 */
export interface UpdateEmployeeData {
  name?: string;
  email?: string;
  jobTitle?: string;
  country?: CountryCode;
  grossSalaryCents?: number;
}

/**
 * Convert database row to domain model
 * Transforms snake_case to camelCase
 */
export function rowToEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    jobTitle: row.job_title,
    country: row.country,
    grossSalaryCents: row.gross_salary_cents,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

/**
 * Convert domain model to database row format
 * Transforms camelCase to snake_case
 */
export function employeeToRow(employee: Partial<Employee>): Partial<EmployeeRow> {
  const row: Partial<EmployeeRow> = {};

  if (employee.id !== undefined) row.id = employee.id;
  if (employee.name !== undefined) row.name = employee.name;
  if (employee.email !== undefined) row.email = employee.email;
  if (employee.jobTitle !== undefined) row.job_title = employee.jobTitle;
  if (employee.country !== undefined) row.country = employee.country;
  if (employee.grossSalaryCents !== undefined) row.gross_salary_cents = employee.grossSalaryCents;
  if (employee.createdAt !== undefined) row.created_at = employee.createdAt;
  if (employee.updatedAt !== undefined) row.updated_at = employee.updatedAt;
  if (employee.deletedAt !== undefined) row.deleted_at = employee.deletedAt;

  return row;
}
