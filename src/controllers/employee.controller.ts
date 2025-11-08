/**
 * Employee Controller
 *
 * HTTP request/response handlers for employee endpoints
 * Handles only HTTP concerns - delegates business logic to service layer
 * Returns consistent JSON responses with appropriate status codes
 *
 * @module controllers/employee
 */
import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service';
import { CreateEmployeeInput, UpdateEmployeeInput } from '../schemas/employee.schema';

export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  /**
   * POST /api/employees
   * Create a new employee
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateEmployeeInput = req.body;
      const employee = await this.employeeService.createEmployee(data);

      res.status(201).json({
        status: 'success',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/employees/:id
   * Get employee by ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const employee = await this.employeeService.getEmployeeById(id);

      res.status(200).json({
        status: 'success',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/employees
   * Get all employees with optional filters and pagination
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, country, jobTitle } = req.query;

      const result = await this.employeeService.getAllEmployees({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        country: country as string | undefined,
        jobTitle: jobTitle as string | undefined,
      });

      res.status(200).json({
        status: 'success',
        data: result.employees,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/employees/:id
   * Update employee by ID
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const data: UpdateEmployeeInput = req.body;

      const employee = await this.employeeService.updateEmployee(id, data);

      res.status(200).json({
        status: 'success',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/employees/:id
   * Delete employee by ID
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.employeeService.deleteEmployee(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/employees/:id/salary
   * Get salary details with deductions for an employee
   */
  getSalaryDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const salaryDetails = await this.employeeService.getEmployeeSalaryDetails(id);

      res.status(200).json({
        status: 'success',
        data: salaryDetails,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/employees/metrics/by-country
   * Get salary metrics grouped by country
   */
  getMetricsByCountry = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const metrics = await this.employeeService.getSalaryMetricsByCountry();

      res.status(200).json({
        status: 'success',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/employees/metrics/by-job-title
   * Get salary metrics grouped by job title
   */
  getMetricsByJobTitle = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const metrics = await this.employeeService.getSalaryMetricsByJobTitle();

      res.status(200).json({
        status: 'success',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/salary-metrics
   * Get combined salary metrics with optional filters
   */
  getSalaryMetrics = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { country, jobTitle } = _req.query;
      
      const metrics = await this.employeeService.getSalaryMetrics({
        country: country as string | undefined,
        jobTitle: jobTitle as string | undefined,
      });

      res.status(200).json({
        status: 'success',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };
}
