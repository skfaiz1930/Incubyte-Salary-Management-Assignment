/**
 * Employee Routes
 *
 * Defines all employee-related HTTP routes
 * Applies validation middleware before controller handlers
 *
 * @module routes/employee
 */
import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { validate } from '../middleware/validation.middleware';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeIdSchema,
  paginationSchema,
} from '../schemas/employee.schema';

export function createEmployeeRoutes(controller: EmployeeController): Router {
  const router = Router();

  /**
   * GET /api/employees/salary-metrics
   * Get combined salary metrics with optional country and job title filters
   */
  router.get('/salary-metrics', controller.getSalaryMetrics);

  /**
   * POST /api/employees
   * Create a new employee
   */
  router.post('/', validate(createEmployeeSchema), controller.create);

  /**
   * GET /api/employees
   * Get all employees with optional filters
   */
  router.get('/', validate(paginationSchema), controller.getAll);

  /**
   * GET /api/employees/deleted
   * Get all soft-deleted employees
   */
  router.get('/deleted', controller.getDeleted);

  /**
   * GET /api/employees/:id
   * Get employee by ID
   */
  router.get('/:id', validate(employeeIdSchema), controller.getById);

  /**
   * PUT /api/employees/:id
   * Update employee by ID
   */
  router.put('/:id', validate(updateEmployeeSchema), controller.update);

  /**
   * DELETE /api/employees/:id
   * Soft delete employee by ID (sets deleted_at timestamp)
   */
  router.delete('/:id', validate(employeeIdSchema), controller.delete);

  /**
   * POST /api/employees/:id/restore
   * Restore a soft-deleted employee
   */
  router.post('/:id/restore', validate(employeeIdSchema), controller.restore);

  /**
   * DELETE /api/employees/:id/force
   * Permanently delete an employee (hard delete)
   */
  router.delete('/:id/force', validate(employeeIdSchema), controller.forceDelete);

  /**
   * GET /api/employees/:id/salary
   * Get salary details with deductions
   */
  router.get('/:id/salary', validate(employeeIdSchema), controller.getSalaryDetails);

  return router;
}
