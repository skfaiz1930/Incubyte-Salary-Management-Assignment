/**
 * Employee API Integration Tests
 *
 * Tests the full HTTP request/response cycle
 * Uses in-memory SQLite for isolation
 * Resets database before each test suite
 *
 * @module tests/integration/employee
 */
import request from 'supertest';
import { Knex } from 'knex';
import knex from 'knex';
import { app } from '../../src/app';
import {
  validEmployeeData,
  validEmployeeData2,
  validEmployeeData3,
} from '../fixtures/employees';

describe('Employee API Integration Tests', () => {
  let testDb: Knex;

  // Setup test database before all tests
  beforeAll(async () => {
    testDb = knex({
      client: 'sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });

    // Run migrations
    await testDb.migrate.latest({
      directory: './src/db/migrations',
    });
  });

  // Clean up after all tests
  afterAll(async () => {
    await testDb.destroy();
  });

  // Clean employees table before each test
  beforeEach(async () => {
    await testDb('employees').del();
  });

  describe('POST /api/employees', () => {
    it('should create employee with valid data', async () => {
      const response = await request(app)
        .post('/api/employees')
        .send(validEmployeeData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        id: expect.any(Number),
        name: validEmployeeData.name,
        email: validEmployeeData.email,
        jobTitle: validEmployeeData.jobTitle,
        country: validEmployeeData.country,
        grossSalaryCents: validEmployeeData.grossSalaryCents,
      });
    });

    it('should reject employee with invalid email', async () => {
      const response = await request(app)
        .post('/api/employees')
        .send({
          ...validEmployeeData,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Validation failed');
    });

    it('should reject employee with negative salary', async () => {
      const response = await request(app)
        .post('/api/employees')
        .send({
          ...validEmployeeData,
          grossSalaryCents: -1000,
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Validation failed');
    });

    it('should reject employee with invalid country', async () => {
      const response = await request(app)
        .post('/api/employees')
        .send({
          ...validEmployeeData,
          country: 'XX',
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should reject duplicate email', async () => {
      // Create first employee
      await request(app).post('/api/employees').send(validEmployeeData).expect(201);

      // Try to create with same email
      const response = await request(app)
        .post('/api/employees')
        .send(validEmployeeData)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('already exists');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app).post('/api/employees').send({}).expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('GET /api/employees/:id', () => {
    it('should get employee by id', async () => {
      // Create employee first
      const createResponse = await request(app)
        .post('/api/employees')
        .send(validEmployeeData);

      const employeeId = createResponse.body.data.id;

      // Get employee
      const response = await request(app).get(`/api/employees/${employeeId}`).expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(employeeId);
      expect(response.body.data.email).toBe(validEmployeeData.email);
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await request(app).get('/api/employees/999999').expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not found');
    });

    it('should reject invalid id format', async () => {
      const response = await request(app).get('/api/employees/invalid').expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/employees', () => {
    beforeEach(async () => {
      // Create test employees
      await request(app).post('/api/employees').send(validEmployeeData);
      await request(app).post('/api/employees').send(validEmployeeData2);
      await request(app).post('/api/employees').send(validEmployeeData3);
    });

    it('should get all employees', async () => {
      const response = await request(app).get('/api/employees').expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
    });

    it('should filter employees by country', async () => {
      const response = await request(app).get('/api/employees?country=US').expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((emp: any) => {
        expect(emp.country).toBe('US');
      });
    });

    it('should paginate employees', async () => {
      const response = await request(app).get('/api/employees?page=1&limit=2').expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should reject invalid pagination params', async () => {
      await request(app).get('/api/employees?page=abc').expect(400);
      await request(app).get('/api/employees?limit=abc').expect(400);
    });
  });

  describe('PUT /api/employees/:id', () => {
    it('should update employee', async () => {
      // Create employee
      const createResponse = await request(app)
        .post('/api/employees')
        .send(validEmployeeData);

      const employeeId = createResponse.body.data.id;

      // Update employee
      const updateData = {
        name: 'Updated Name',
        grossSalaryCents: 12000000,
      };

      const response = await request(app)
        .put(`/api/employees/${employeeId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.grossSalaryCents).toBe(updateData.grossSalaryCents);
      expect(response.body.data.email).toBe(validEmployeeData.email); // Unchanged
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await request(app)
        .put('/api/employees/999999')
        .send({ name: 'Test' })
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    it('should reject duplicate email update', async () => {
      // Create two employees
      const emp1 = await request(app).post('/api/employees').send(validEmployeeData);
      await request(app).post('/api/employees').send(validEmployeeData2);

      // Try to update emp1 with emp2's email
      const response = await request(app)
        .put(`/api/employees/${emp1.body.data.id}`)
        .send({ email: validEmployeeData2.email })
        .expect(409);

      expect(response.body.status).toBe('error');
    });

    it('should reject invalid update data', async () => {
      const createResponse = await request(app)
        .post('/api/employees')
        .send(validEmployeeData);

      const response = await request(app)
        .put(`/api/employees/${createResponse.body.data.id}`)
        .send({ grossSalaryCents: -1000 })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('should delete employee', async () => {
      // Create employee
      const createResponse = await request(app)
        .post('/api/employees')
        .send(validEmployeeData);

      const employeeId = createResponse.body.data.id;

      // Delete employee
      await request(app).delete(`/api/employees/${employeeId}`).expect(204);

      // Verify deleted
      await request(app).get(`/api/employees/${employeeId}`).expect(404);
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await request(app).delete('/api/employees/999999').expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/employees/:id/salary', () => {
    it('should get salary details with deductions', async () => {
      // Create employee
      const createResponse = await request(app)
        .post('/api/employees')
        .send(validEmployeeData);

      const employeeId = createResponse.body.data.id;

      // Get salary details
      const response = await request(app)
        .get(`/api/employees/${employeeId}/salary`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        grossSalaryCents: validEmployeeData.grossSalaryCents,
        deductions: expect.any(Array),
        totalDeductionsCents: expect.any(Number),
        netSalaryCents: expect.any(Number),
      });

      expect(response.body.data.deductions.length).toBeGreaterThan(0);
      expect(response.body.data.netSalaryCents).toBeLessThan(
        response.body.data.grossSalaryCents
      );
    });

    it('should return 404 for non-existent employee', async () => {
      await request(app).get('/api/employees/999999/salary').expect(404);
    });
  });

  describe('GET /api/employees/salary-metrics', () => {
    beforeEach(async () => {
      // Create test employees with different countries and job titles
      await request(app).post('/api/employees').send(validEmployeeData);
      await request(app).post('/api/employees').send(validEmployeeData2);
      await request(app).post('/api/employees').send(validEmployeeData3);
    });

    it('should get combined salary metrics', async () => {
      const response = await request(app)
        .get('/api/employees/salary-metrics')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual({
        byCountry: expect.any(Array),
        byJobTitle: expect.any(Array),
      });

      // Test country metrics
      const countryMetrics = response.body.data.byCountry;
      expect(countryMetrics.length).toBeGreaterThan(0);
      expect(countryMetrics[0]).toMatchObject({
        country: expect.any(String),
        avgSalaryCents: expect.any(Number),
        minSalaryCents: expect.any(Number),
        maxSalaryCents: expect.any(Number),
        employeeCount: expect.any(Number),
      });

      // Test job title metrics
      const jobTitleMetrics = response.body.data.byJobTitle;
      expect(jobTitleMetrics.length).toBeGreaterThan(0);
      expect(jobTitleMetrics[0]).toMatchObject({
        jobTitle: expect.any(String),
        avgSalaryCents: expect.any(Number),
        minSalaryCents: expect.any(Number),
        maxSalaryCents: expect.any(Number),
        employeeCount: expect.any(Number),
      });
    });

    it('should filter metrics by country', async () => {
      const response = await request(app)
        .get('/api/employees/salary-metrics?country=US')
        .expect(200);

      // Should only have US in country metrics
      expect(response.body.data.byCountry).toHaveLength(1);
      expect(response.body.data.byCountry[0].country).toBe('US');
      
      // Job titles should still include all job titles, but with filtered counts
      const engineerMetrics = response.body.data.byJobTitle.find(
        (m: any) => m.jobTitle === validEmployeeData.jobTitle
      );
      expect(engineerMetrics).toBeDefined();
    });

    it('should filter metrics by job title', async () => {
      const response = await request(app)
        .get(`/api/employees/salary-metrics?jobTitle=${encodeURIComponent(validEmployeeData.jobTitle)}`)
        .expect(200);

      // Should only have the specified job title in metrics
      const jobTitleMetrics = response.body.data.byJobTitle;
      expect(jobTitleMetrics.length).toBe(1);
      expect(jobTitleMetrics[0].jobTitle).toBe(validEmployeeData.jobTitle);
      
      // Countries should still include all countries, but with filtered counts
      expect(response.body.data.byCountry.length).toBeGreaterThan(0);
    });

    it('should filter by both country and job title', async () => {
      const response = await request(app)
        .get(
          `/api/employees/salary-metrics?country=US&jobTitle=${encodeURIComponent(validEmployeeData.jobTitle)}`
        )
        .expect(200);

      // Should only have matching country and job title
      expect(response.body.data.byCountry).toHaveLength(1);
      expect(response.body.data.byCountry[0].country).toBe('US');
      
      expect(response.body.data.byJobTitle).toHaveLength(1);
      expect(response.body.data.byJobTitle[0].jobTitle).toBe(validEmployeeData.jobTitle);
    });

    it('should return empty arrays when no data matches filters', async () => {
      const response = await request(app)
        .get('/api/employees/salary-metrics?country=XX&jobTitle=Nonexistent')
        .expect(200);

      expect(response.body.data.byCountry).toHaveLength(0);
      expect(response.body.data.byJobTitle).toHaveLength(0);
    });
  });

  describe('GET /health', () => {
    it('should return health check', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/api/nonexistent').expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not found');
    });
  });
});
