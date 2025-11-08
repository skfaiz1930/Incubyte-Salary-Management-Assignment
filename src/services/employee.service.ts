/**
 * Employee Service
 *
 * Business logic layer for employee management
 * Handles CRUD operations with validation and business rules
 * Delegates data access to repository layer
 *
 * @module services/employee
 */
import { EmployeeRepository } from '../repositories/employee.repository';
import { SalaryService } from './salary.service';
import {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
} from '../models/employee.model';
import {
  SalaryDetails,
  CountrySalaryMetrics,
  JobTitleSalaryMetrics,
} from '../models/salary.model';
import { NotFoundError, ConflictError } from '../utils/errors';

export class EmployeeService {
  constructor(
    private employeeRepository: EmployeeRepository,
    private salaryService: SalaryService
  ) {}

  /**
   * Create a new employee
   *
   * Validates email uniqueness before creation
   *
   * @param data - Employee creation data
   * @returns Created employee
   * @throws ConflictError if email already exists
   */
  async createEmployee(data: CreateEmployeeData): Promise<Employee> {
    // Check if email already exists
    const existingEmployee = await this.employeeRepository.findByEmail(data.email);
    if (existingEmployee) {
      throw new ConflictError(`Employee with email ${data.email} already exists`);
    }

    return this.employeeRepository.create(data);
  }

  /**
   * Get employee by ID
   *
   * @param id - Employee ID
   * @returns Employee record
   * @throws NotFoundError if employee not found
   */
  async getEmployeeById(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findById(id);

    if (!employee) {
      throw new NotFoundError('Employee', id);
    }

    return employee;
  }

  /**
   * Get all employees with optional filters and pagination
   *
   * @param options - Query options
   * @returns Paginated employees and metadata
   */
  async getAllEmployees(options: {
    country?: string;
    jobTitle?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    employees: Employee[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10 } = options;

    const { employees, total } = await this.employeeRepository.findAll(options);

    const totalPages = Math.ceil(total / limit);

    return {
      employees,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update employee by ID
   *
   * Validates email uniqueness if email is being updated
   *
   * @param id - Employee ID
   * @param data - Updated employee data
   * @returns Updated employee
   * @throws NotFoundError if employee not found
   * @throws ConflictError if email already exists
   */
  async updateEmployee(id: number, data: UpdateEmployeeData): Promise<Employee> {
    // Check if employee exists
    const existingEmployee = await this.employeeRepository.findById(id);
    if (!existingEmployee) {
      throw new NotFoundError('Employee', id);
    }

    // If email is being updated, check uniqueness
    if (data.email && data.email !== existingEmployee.email) {
      const emailExists = await this.employeeRepository.emailExists(data.email, id);
      if (emailExists) {
        throw new ConflictError(`Employee with email ${data.email} already exists`);
      }
    }

    const updatedEmployee = await this.employeeRepository.update(id, data);

    if (!updatedEmployee) {
      throw new NotFoundError('Employee', id);
    }

    return updatedEmployee;
  }

  /**
   * Delete employee by ID
   *
   * @param id - Employee ID
   * @returns True if deleted
   * @throws NotFoundError if employee not found
   */
  async deleteEmployee(id: number): Promise<boolean> {
    const employee = await this.employeeRepository.findById(id);

    if (!employee) {
      throw new NotFoundError('Employee', id);
    }

    return this.employeeRepository.delete(id);
  }

  /**
   * Calculate salary details for an employee
   *
   * Retrieves employee and calculates complete salary breakdown with deductions
   *
   * @param id - Employee ID
   * @returns Salary details with deductions
   * @throws NotFoundError if employee not found
   */
  async getEmployeeSalaryDetails(id: number): Promise<SalaryDetails> {
    const employee = await this.getEmployeeById(id);

    return this.salaryService.calculateSalaryDetails(
      employee.grossSalaryCents,
      employee.country
    );
  }

  /**
   * Get salary metrics grouped by country
   *
   * @returns Array of country salary metrics
   */
  async getSalaryMetricsByCountry(): Promise<CountrySalaryMetrics[]> {
    return this.employeeRepository.getSalaryMetricsByCountry();
  }

  /**
   * Get salary metrics grouped by job title
   *
   * @returns Array of job title salary metrics
   */
  async getSalaryMetricsByJobTitle(): Promise<JobTitleSalaryMetrics[]> {
    return this.employeeRepository.getSalaryMetricsByJobTitle();
  }

  /**
   * Get combined salary metrics with optional filters
   * 
   * @param options - Filter options
   * @returns Object containing metrics by country and job title
   */
  async getSalaryMetrics(options: {
    country?: string;
    jobTitle?: string;
  } = {}): Promise<{
    byCountry: CountrySalaryMetrics[];
    byJobTitle: JobTitleSalaryMetrics[];
  }> {
    const [byCountry, byJobTitle] = await Promise.all([
      options.country 
        ? this.employeeRepository.getSalaryMetricsByCountry(options.country)
        : this.employeeRepository.getSalaryMetricsByCountry(),
      options.jobTitle 
        ? this.employeeRepository.getSalaryMetricsByJobTitle(options.jobTitle)
        : this.employeeRepository.getSalaryMetricsByJobTitle()
    ]);

    return { byCountry, byJobTitle };
  }
}
