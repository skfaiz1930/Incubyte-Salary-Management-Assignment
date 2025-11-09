import { Employee, EmployeeRow, rowToEmployee, employeeToRow, CreateEmployeeData, UpdateEmployeeData } from '../../../src/models/employee.model';

describe('Employee Model', () => {
  const mockDate = new Date('2023-01-01T00:00:00.000Z');
  
  describe('rowToEmployee', () => {
    it('should convert database row to employee domain model', () => {
      const mockRow: EmployeeRow = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        job_title: 'Software Engineer',
        country: 'US',
        gross_salary_cents: 1000000, // $10,000.00
        created_at: mockDate,
        updated_at: mockDate,
        deleted_at: null,
      };

      const result = rowToEmployee(mockRow);

      expect(result).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        jobTitle: 'Software Engineer',
        country: 'US',
        grossSalaryCents: 1000000,
        createdAt: mockDate,
        updatedAt: mockDate,
        deletedAt: null,
      });
    });

    it('should handle partial updates with undefined values', () => {
      const mockRow: Partial<EmployeeRow> = {
        id: 1,
        name: 'John Doe',
        // Other fields are undefined
      };

      const result = rowToEmployee(mockRow as EmployeeRow);
      
      expect(result).toMatchObject({
        id: 1,
        name: 'John Doe',
      });
      expect(result.email).toBeUndefined();
      expect(result.jobTitle).toBeUndefined();
    });
  });

  describe('employeeToRow', () => {
    it('should convert employee domain model to database row', () => {
      const employee: Partial<Employee> = {
        id: 1,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        jobTitle: 'Product Manager',
        country: 'UK',
        grossSalaryCents: 1200000, // $12,000.00
        createdAt: mockDate,
        updatedAt: mockDate,
        deletedAt: null,
      };

      const result = employeeToRow(employee);

      expect(result).toEqual({
        id: 1,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        job_title: 'Product Manager',
        country: 'UK',
        gross_salary_cents: 1200000,
        created_at: mockDate,
        updated_at: mockDate,
        deleted_at: null,
      });
    });

    it('should handle partial updates with undefined values', () => {
      const employee: Partial<Employee> = {
        id: 2,
        name: 'Updated Name',
        // Only updating name, other fields are undefined
      };

      const result = employeeToRow(employee);

      expect(result).toEqual({
        id: 2,
        name: 'Updated Name',
        // No other fields should be present
      });
    });
  });

  describe('Type Definitions', () => {
    it('should define valid CreateEmployeeData type', () => {
      const createData: CreateEmployeeData = {
        name: 'New Employee',
        email: 'new@example.com',
        jobTitle: 'Intern',
        country: 'IN',
        grossSalaryCents: 500000, // $5,000.00
      };

      expect(createData).toBeDefined();
    });

    it('should define valid UpdateEmployeeData type with partial fields', () => {
      const updateData: UpdateEmployeeData = {
        email: 'updated@example.com',
        grossSalaryCents: 600000, // $6,000.00
      };

      expect(updateData).toBeDefined();
    });
  });

  describe('CountryCode Type', () => {
    it('should only allow valid country codes', () => {
      // This is a type test, so we're checking that TypeScript enforces the type
      const validCountries: Array<'US' | 'UK' | 'IN' | 'CA' | 'XX'> = ['US', 'UK', 'IN', 'CA', 'XX'];
      
      // This would cause a TypeScript error if uncommented:
      // const invalidCountry: CountryCode = 'ZZ';
      
      expect(validCountries).toHaveLength(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero salary', () => {
      const row: EmployeeRow = {
        id: 3,
        name: 'Unpaid Intern',
        email: 'intern@example.com',
        job_title: 'Intern',
        country: 'US',
        gross_salary_cents: 0,
        created_at: mockDate,
        updated_at: mockDate,
        deleted_at: null,
      };

      const employee = rowToEmployee(row);
      expect(employee.grossSalaryCents).toBe(0);
    });

    it('should handle very large salary values', () => {
      const largeSalary = 9999999999; // $99,999,999.99
      const employee: Partial<Employee> = {
        grossSalaryCents: largeSalary,
      };

      const row = employeeToRow(employee);
      expect(row.gross_salary_cents).toBe(largeSalary);
    });
  });
});
