/**
 * Employee Repository
 *
 * Handles all database operations for employees using Knex query builder
 * Implements data access layer with type-safe SQL queries
 * All salary amounts are stored and retrieved as integer cents
 *
 * @module repositories/employee
 */
import { Knex } from 'knex';
import {
  EmployeeRow,
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  rowToEmployee,
  employeeToRow,
} from '../models/employee.model';
import { CountrySalaryMetrics, JobTitleSalaryMetrics } from '../models/salary.model';

export class EmployeeRepository {
  private readonly tableName = 'employees';

  constructor(private db: Knex) {}

  /**
   * Create a new employee record
   *
   * @param data - Employee data with salary in cents
   * @returns Created employee with generated ID
   */
  async create(data: CreateEmployeeData): Promise<Employee> {
    const row: Omit<EmployeeRow, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> & { deleted_at: null } = {
      name: data.name,
      email: data.email,
      job_title: data.jobTitle,
      country: data.country,
      gross_salary_cents: data.grossSalaryCents,
      deleted_at: null, // Explicitly set to null for new records
    };

    const [id] = await this.db(this.tableName).insert(row);

    const created = await this.findById(id);
    if (!created) {
      throw new Error('Failed to create employee');
    }

    return created;
  }

  /**
   * Find employee by ID
   *
   * @param id - Employee ID
   * @returns Employee record or null if not found
   */
  async findById(id: number, includeDeleted = false): Promise<Employee | null> {
    let query = this.db(this.tableName).where('id', id);
    
    if (!includeDeleted) {
      query = query.whereNull('deleted_at');
    }
    
    const row = await query.first<EmployeeRow>();
    return row ? rowToEmployee(row) : null;
  }

  /**
   * Find employee by email
   *
   * @param email - Employee email address
   * @returns Employee record or null if not found
   */
  async findByEmail(email: string, includeDeleted = false): Promise<Employee | null> {
    let query = this.db(this.tableName).where('email', email);
    
    if (!includeDeleted) {
      query = query.whereNull('deleted_at');
    }
    
    const row = await query.first<EmployeeRow>();
    return row ? rowToEmployee(row) : null;
  }

  /**
   * Find all employees with optional filters and pagination
   *
   * @param options - Query options (filters, pagination)
   * @returns Array of employees and total count
   */
  async findAll(options: {
    country?: string;
    jobTitle?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ employees: Employee[]; total: number }> {
    const { country, jobTitle, page = 1, limit = 10 } = options;

    // Build query with filters
    let query = this.db(this.tableName).whereNull('deleted_at');

    if (country) {
      query = query.where({ country });
    }

    if (jobTitle) {
      query = query.where({ job_title: jobTitle });
    }

    // Get total count
    const [{ count }] = await query.clone().count('* as count');
    const total = Number(count);

    // Get paginated results
    const offset = (page - 1) * limit;
    const rows = await query
      .clone()
      .select('*')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');

    const employees = rows.map(rowToEmployee);

    return { employees, total };
  }

  /**
   * Update employee by ID
   *
   * @param id - Employee ID
   * @param data - Updated employee data
   * @returns Updated employee or null if not found
   */
  async update(id: number, data: UpdateEmployeeData): Promise<Employee | null> {
    const updateRow = employeeToRow({
      name: data.name,
      email: data.email,
      jobTitle: data.jobTitle,
      country: data.country,
      grossSalaryCents: data.grossSalaryCents,
      updatedAt: new Date(),
    });

    const updatedCount = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update(updateRow);

    if (updatedCount === 0) {
      return null;
    }

    return this.findById(id);
  }

  /**
   * Delete employee by ID
   *
   * @param id - Employee ID
   * @returns True if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    const deletedCount = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        deleted_at: this.db.fn.now(),
        updated_at: this.db.fn.now()
      });

    return deletedCount > 0;
  }

  /**
   * Get salary metrics grouped by country
   *
   * @returns Array of country metrics with average, min, max salaries and employee count
   */
  async getSalaryMetricsByCountry(country?: string): Promise<CountrySalaryMetrics[]> {
    let query = this.db(this.tableName)
      .select('country')
      .avg('gross_salary_cents as avgSalaryCents')
      .min('gross_salary_cents as minSalaryCents')
      .max('gross_salary_cents as maxSalaryCents')
      .count('* as employeeCount')
      .whereNull('deleted_at')
      .groupBy('country');

    if (country) {
      query = query.where('country', country);
    }

    const results = await query;

    return results.map((row) => ({
      country: row.country,
      avgSalaryCents: Math.round(Number(row.avgSalaryCents)),
      minSalaryCents: Number(row.minSalaryCents),
      maxSalaryCents: Number(row.maxSalaryCents),
      employeeCount: Number(row.employeeCount),
    }));
  }

  /**
   * Get salary metrics grouped by job title
   *
   * @returns Array of job title metrics with average, min, max salaries and employee count
   */
  async getSalaryMetricsByJobTitle(jobTitle?: string): Promise<JobTitleSalaryMetrics[]> {
    let query = this.db(this.tableName)
      .select('job_title as jobTitle')
      .avg('gross_salary_cents as avgSalaryCents')
      .min('gross_salary_cents as minSalaryCents')
      .max('gross_salary_cents as maxSalaryCents')
      .count('* as employeeCount')
      .whereNull('deleted_at')
      .groupBy('job_title');

    if (jobTitle) {
      query = query.where('job_title', jobTitle);
    }

    const results = await query;

    return results.map((row) => ({
      jobTitle: row.jobTitle,
      avgSalaryCents: Math.round(Number(row.avgSalaryCents)),
      minSalaryCents: Number(row.minSalaryCents),
      maxSalaryCents: Number(row.maxSalaryCents),
      employeeCount: Number(row.employeeCount),
    }));
  }

  /**
   * Check if email exists (for uniqueness validation)
   *
   * @param email - Email to check
   * @param excludeId - Employee ID to exclude (for updates)
   * @returns True if email exists
   */
  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    let query = this.db(this.tableName).where({ email });

    if (excludeId) {
      query = query.whereNot({ id: excludeId });
    }

    const row = await query.first();
    return !!row;
  }

  /**
   * Find all soft-deleted employees
   * 
   * @returns Array of soft-deleted employees
   */
  async findDeleted(): Promise<Employee[]> {
    const rows = await this.db(this.tableName)
      .whereNotNull('deleted_at')
      .select<EmployeeRow[]>('*');
    
    return rows.map(rowToEmployee);
  }

  /**
   * Restore a soft-deleted employee
   * 
   * @param id - Employee ID to restore
   * @returns True if restored, false if not found or not deleted
   */
  async restore(id: number): Promise<boolean> {
    const updatedCount = await this.db(this.tableName)
      .where({ id })
      .whereNotNull('deleted_at')
      .update({
        deleted_at: null,
        updated_at: this.db.fn.now()
      });

    return updatedCount > 0;
  }

  /**
   * Permanently delete an employee (hard delete)
   * 
   * @param id - Employee ID to permanently delete
   * @returns True if deleted, false if not found
   */
  async forceDelete(id: number): Promise<boolean> {
    const deletedCount = await this.db(this.tableName)
      .where({ id })
      .delete();

    return deletedCount > 0;
  }
}
