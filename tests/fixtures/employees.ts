/**
 * Test Fixtures
 *
 * Predefined test data for employee tests
 * All salaries in cents to match production code
 *
 * @module tests/fixtures/employees
 */
import { CreateEmployeeData } from '../../src/models/employee.model';

export const validEmployeeData: CreateEmployeeData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  jobTitle: 'Software Engineer',
  country: 'US',
  grossSalaryCents: 10000000, // $100,000.00
};

export const validEmployeeData2: CreateEmployeeData = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  jobTitle: 'Product Manager',
  country: 'UK',
  grossSalaryCents: 15000000, // $150,000.00
};

export const validEmployeeData3: CreateEmployeeData = {
  name: 'Raj Kumar',
  email: 'raj.kumar@example.com',
  jobTitle: 'Software Engineer',
  country: 'IN',
  grossSalaryCents: 5000000, // $50,000.00 (or ₹5,000.00)
};

export const validEmployeeDataCA: CreateEmployeeData = {
  name: 'Alice Johnson',
  email: 'alice.johnson@example.com',
  jobTitle: 'Engineering Manager',
  country: 'CA',
  grossSalaryCents: 12000000, // $120,000.00 CAD
};

export const invalidEmployeeData = {
  name: 'X', // Too short
  email: 'invalid-email', // Invalid format
  jobTitle: 'E', // Too short
  country: 'XX', // Invalid country
  grossSalaryCents: -1000, // Negative salary
};
