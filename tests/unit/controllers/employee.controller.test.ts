import { Request, Response, NextFunction } from 'express';
import { EmployeeController } from '../../../src/controllers/employee.controller';
import { EmployeeService } from '../../../src/services/employee.service';
import { Employee } from '../../../src/models/employee.model';
import { CountryCode } from '../../../src/models/employee.model';
import { DeductionType } from '../../../src/models/salary.model';

describe('EmployeeController', () => {
  let employeeController: EmployeeController;
  let mockEmployeeService: jest.Mocked<EmployeeService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let jsonResponse: any;
  let statusResponse: any;

  beforeEach(() => {
    // Setup mock service
    mockEmployeeService = {
      createEmployee: jest.fn(),
      getEmployeeById: jest.fn(),
      getAllEmployees: jest.fn(),
      updateEmployee: jest.fn(),
      deleteEmployee: jest.fn(),
      getEmployeeSalaryDetails: jest.fn(),
      getSalaryMetricsByCountry: jest.fn(),
      getSalaryMetricsByJobTitle: jest.fn(),
      getSalaryMetrics: jest.fn(),
    } as any;

    // Setup mock response
    jsonResponse = jest.fn();
    statusResponse = { json: jsonResponse };
    mockResponse = {
      status: jest.fn().mockReturnValue(statusResponse),
      json: jsonResponse,
    };

    mockNext = jest.fn();
    employeeController = new EmployeeController(mockEmployeeService);
  });

  describe('create', () => {
    it('should create a new employee and return 201 status', async () => {
      const employeeData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        country: 'US' as CountryCode,
        grossSalaryCents: 5000000, // $50,000 in cents
      };

      const createdEmployee: Employee = {
        id: 1,
        ...employeeData,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockEmployeeService.createEmployee.mockResolvedValue(createdEmployee);
      mockRequest = { body: employeeData };

      await employeeController.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockEmployeeService.createEmployee).toHaveBeenCalledWith(employeeData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(jsonResponse).toHaveBeenCalledWith({
        status: 'success',
        data: createdEmployee,
      });
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Test error');
      mockEmployeeService.createEmployee.mockRejectedValue(error);
      mockRequest = { body: {} };

      await employeeController.create(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('should return employee by id', async () => {
      const employee: Employee = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        jobTitle: 'Software Engineer',
        country: 'US' as CountryCode,
        grossSalaryCents: 5000000,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockEmployeeService.getEmployeeById.mockResolvedValue(employee);
      mockRequest = { params: { id: '1' } };

      await employeeController.getById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockEmployeeService.getEmployeeById).toHaveBeenCalledWith(1);
      expect(jsonResponse).toHaveBeenCalledWith({
        status: 'success',
        data: employee,
      });
    });
  });

  describe('getAll', () => {
    it('should return all employees with default pagination', async () => {
      const employees: Employee[] = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          jobTitle: 'Engineer',
          country: 'US' as CountryCode,
          grossSalaryCents: 5000000,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          jobTitle: 'Manager',
          country: 'CA' as CountryCode,
          grossSalaryCents: 7000000,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];
      const pagination = { page: 1, limit: 10, total: 2, totalPages: 1 };
      mockEmployeeService.getAllEmployees.mockResolvedValue({
        employees,
        ...pagination,
      });

      mockRequest = { query: {} };

      await employeeController.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockEmployeeService.getAllEmployees).toHaveBeenCalledWith({});
      expect(jsonResponse).toHaveBeenCalledWith({
        status: 'success',
        data: employees,
        pagination,
      });
    });

    it('should apply filters when provided', async () => {
      const filters = { country: 'US', jobTitle: 'Engineer', page: '2', limit: '5' };
      mockRequest = { query: filters };

      await employeeController.getAll(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockEmployeeService.getAllEmployees).toHaveBeenCalledWith({
        country: 'US',
        jobTitle: 'Engineer',
        page: 2,
        limit: 5,
      });
    });
  });

  describe('update', () => {
    it('should update an existing employee', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedEmployee: Employee = {
        id: 1,
        name: 'Updated Name',
        email: 'john.doe@example.com',
        jobTitle: 'Software Engineer',
        country: 'US' as CountryCode,
        grossSalaryCents: 5000000,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockEmployeeService.updateEmployee.mockResolvedValue(updatedEmployee);
      mockRequest = {
        params: { id: '1' },
        body: updateData,
      };

      await employeeController.update(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockEmployeeService.updateEmployee).toHaveBeenCalledWith(1, updateData);
      expect(jsonResponse).toHaveBeenCalledWith({
        status: 'success',
        data: updatedEmployee,
      });
    });
  });

  describe('delete', () => {
    it('should delete an employee', async () => {
      mockEmployeeService.deleteEmployee.mockResolvedValue(true);
      mockRequest = { params: { id: '1' } };

      await employeeController.delete(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockEmployeeService.deleteEmployee).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });
  });

  describe('getSalaryDetails', () => {
    it('should return salary details for an employee', async () => {
      const salaryDetails = {
        grossSalaryCents: 10000000,
        totalDeductionsCents: 3000000,
        netSalaryCents: 7000000,
        deductions: [
          {
            type: DeductionType.TAX,
            amountCents: 2000000,
            percentage: 20,
            description: 'Income tax',
          },
          {
            type: DeductionType.INSURANCE,
            amountCents: 1000000,
            percentage: 10,
            description: 'Health insurance',
          },
        ],
      };
      mockEmployeeService.getEmployeeSalaryDetails.mockResolvedValue(salaryDetails);
      mockRequest = { params: { id: '1' } };

      await employeeController.getSalaryDetails(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockEmployeeService.getEmployeeSalaryDetails).toHaveBeenCalledWith(1);
      expect(jsonResponse).toHaveBeenCalledWith({
        status: 'success',
        data: salaryDetails,
      });
    });
  });

  describe('getSalaryMetrics', () => {
    it('should return salary metrics with filters', async () => {
      const metrics = {
        byCountry: [
          {
            country: 'US' as CountryCode,
            avgSalaryCents: 8000000,
            minSalaryCents: 5000000,
            maxSalaryCents: 11000000,
            employeeCount: 10,
          },
        ],
        byJobTitle: [
          {
            jobTitle: 'Engineer',
            avgSalaryCents: 8500000,
            minSalaryCents: 5000000,
            maxSalaryCents: 12000000,
            employeeCount: 8,
          },
        ],
      };
      mockEmployeeService.getSalaryMetrics.mockResolvedValue(metrics);
      mockRequest = { query: { country: 'US', jobTitle: 'Engineer' } };

      await employeeController.getSalaryMetrics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockEmployeeService.getSalaryMetrics).toHaveBeenCalledWith({
        country: 'US',
        jobTitle: 'Engineer',
      });
      expect(jsonResponse).toHaveBeenCalledWith({
        status: 'success',
        data: metrics,
      });
    });
  });
});
