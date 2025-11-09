# Windsurf Code Editor Instructions - Employee Salary Management API

## 🎯 Project Overview
You are building an **API-only Node.js (TypeScript) service** that manages employees in SQLite with strict TDD practices, clean architecture, and production-ready patterns.

## 📋 Core Requirements

### Primary Functionality
- **Employee CRUD**: Create, Read, Update, Delete employee records
- **Salary Calculation**: Apply deduction rules and calculate net salaries
- **Salary Metrics**: Aggregate statistics by country and job title
- **Validation**: Strong input validation at API boundaries
- **Security**: Rate limiting, helmet, CORS protection
- **Observability**: Structured logging with Pino

### Architecture Principles
1. **Strict Layering**: Controller → Service → Repository
   - Controllers: HTTP handling only (req/res, status codes)
   - Services: Business logic, deduction rules, metrics calculations
   - Repositories: Database access via query builder
   
2. **Test-Driven Development**: Write tests BEFORE implementation
   - Use Jest + Supertest for HTTP integration tests
   - Isolated SQLite databases per test (`:memory:` or temp files)
   - 100% coverage for critical business logic
   
3. **Type Safety**: Leverage TypeScript strictly
   - No `any` types unless absolutely necessary
   - Zod schemas for runtime validation
   - Typed error responses

4. **Financial Accuracy**: Handle money as integer cents
   ```typescript
   // ❌ BAD: Floating point errors
   const salary = 50000.55;
   const deduction = salary * 0.15; // Precision issues
   
   // ✅ GOOD: Integer cents
   const salaryInCents = 5000055; // $50,000.55
   const deduction = Math.floor(salaryInCents * 15 / 100); // Integer division
   ```

## 🏗️ Folder Structure

```
/
├── src/
│   ├── controllers/       # HTTP request/response handlers
│   │   └── employee.controller.ts
│   ├── services/          # Business logic layer
│   │   ├── employee.service.ts
│   │   └── salary.service.ts
│   ├── repositories/      # Data access layer
│   │   └── employee.repository.ts
│   ├── models/            # Domain entities and types
│   │   ├── employee.model.ts
│   │   └── salary.model.ts
│   ├── schemas/           # Zod validation schemas
│   │   └── employee.schema.ts
│   ├── middleware/        # Express middleware
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── logger.middleware.ts
│   ├── config/            # Configuration
│   │   ├── database.ts
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── logger.ts
│   │   └── errors.ts
│   ├── db/                # Database migrations and seeds
│   │   └── migrations/
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server entry point
├── tests/
│   ├── integration/       # API integration tests
│   │   └── employee.test.ts
│   ├── unit/              # Unit tests for services
│   │   ├── employee.service.test.ts
│   │   └── salary.service.test.ts
│   ├── fixtures/          # Test data
│   │   └── employees.ts
│   └── setup.ts           # Test environment setup
├── .husky/                # Git hooks
│   ├── pre-commit
│   └── commit-msg
├── knexfile.ts            # Knex configuration
├── tsconfig.json          # TypeScript config
├── jest.config.js         # Jest configuration
├── .eslintrc.js           # ESLint rules
├── .prettierrc            # Prettier config
├── .env.example           # Environment variables template
├── package.json
└── README.md
```

## 🛠️ Tech Stack Setup

### Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "knex": "^3.0.1",
    "sqlite3": "^5.1.6",
    "zod": "^3.22.4",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "pino": "^8.16.2",
    "pino-http": "^8.5.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jest": "^29.5.10",
    "@types/supertest": "^2.0.16",
    "typescript": "^5.3.2",
    "ts-node": "^10.9.1",
    "ts-node-dev": "^2.0.0",
    "ts-jest": "^29.1.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.13.2",
    "@typescript-eslint/parser": "^6.13.2",
    "eslint-config-airbnb-base": "^15.0.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.1.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "@commitlint/cli": "^18.4.3",
    "@commitlint/config-conventional": "^18.4.3"
  }
}
```

### Scripts
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:unit": "jest --testPathPattern=tests/unit",
    "lint": "eslint src tests --ext .ts",
    "lint:fix": "eslint src tests --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\" \"tests/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "migrate:latest": "knex migrate:latest",
    "migrate:rollback": "knex migrate:rollback",
    "migrate:make": "knex migrate:make",
    "prepare": "husky install"
  }
}
```

## 📝 Code Style Guidelines

### 1. **Comprehensive Comments**
Every file should have:
- **File-level JSDoc**: Purpose, responsibilities, dependencies
- **Function-level JSDoc**: Parameters, return types, examples
- **Inline comments**: For complex business logic

```typescript
/**
 * Employee Service
 * 
 * Handles business logic for employee management including:
 * - CRUD operations with validation
 * - Salary calculations with deduction rules
 * - Salary metrics aggregation by country and job title
 * 
 * @module services/employee
 * @requires repositories/employee
 * @requires services/salary
 */

/**
 * Calculate net salary after applying all deduction rules
 * 
 * Deduction rules:
 * - Tax: Progressive based on salary brackets
 * - Insurance: Fixed percentage
 * - Retirement: Fixed percentage with cap
 * 
 * @param grossSalaryInCents - Gross salary in cents (e.g., 5000000 = $50,000.00)
 * @param country - Employee country for tax rules
 * @returns Net salary in cents after all deductions
 * 
 * @example
 * const net = calculateNetSalary(5000000, 'US'); // Returns 3750000 ($37,500.00)
 */
export function calculateNetSalary(
  grossSalaryInCents: number,
  country: string
): number {
  // Apply progressive tax based on brackets
  const taxInCents = calculateTax(grossSalaryInCents, country);
  
  // Insurance is 5% of gross (capped at $10,000/year)
  const insuranceCap = 1000000; // $10,000 in cents
  const insuranceInCents = Math.min(
    Math.floor(grossSalaryInCents * 5 / 100),
    insuranceCap
  );
  
  return grossSalaryInCents - taxInCents - insuranceInCents;
}
```

### 2. **Error Handling**
- Custom error classes with status codes
- Consistent error response format
- Never expose internal errors to clients

```typescript
/**
 * Custom application errors with HTTP status codes
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string | number) {
    super(404, `${resource} with id ${id} not found`);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

/**
 * Global error handling middleware
 * Logs errors and returns consistent JSON responses
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(err);
  
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
    return;
  }
  
  // Generic 500 for unexpected errors
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
```

### 3. **Validation with Zod**
```typescript
import { z } from 'zod';

/**
 * Employee creation schema
 * Validates all required fields with business rules
 */
export const createEmployeeSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters'),
    email: z.string()
      .email('Invalid email format')
      .toLowerCase(),
    jobTitle: z.string()
      .min(2, 'Job title must be at least 2 characters'),
    country: z.enum(['US', 'UK', 'IN', 'CA'], {
      errorMap: () => ({ message: 'Invalid country code' })
    }),
    grossSalaryInCents: z.number()
      .int('Salary must be an integer (cents)')
      .min(0, 'Salary cannot be negative')
      .max(100000000000, 'Salary exceeds maximum (1 billion dollars)')
  })
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>['body'];

/**
 * Validation middleware factory
 * Returns middleware that validates request against Zod schema
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors
        });
        return;
      }
      next(error);
    }
  };
};
```

### 4. **Repository Pattern**
```typescript
/**
 * Employee Repository
 * 
 * Handles all database operations for employees
 * Uses Knex query builder for type-safe SQL
 * All salary amounts stored/retrieved as integer cents
 * 
 * @module repositories/employee
 */
import { Knex } from 'knex';

export interface EmployeeRow {
  id: number;
  name: string;
  email: string;
  job_title: string;
  country: string;
  gross_salary_cents: number;
  created_at: Date;
  updated_at: Date;
}

export class EmployeeRepository {
  private readonly tableName = 'employees';
  
  constructor(private db: Knex) {}
  
  /**
   * Create a new employee record
   * 
   * @param data - Employee data with salary in cents
   * @returns Created employee with generated ID
   */
  async create(data: Omit<EmployeeRow, 'id' | 'created_at' | 'updated_at'>): Promise<EmployeeRow> {
    const [id] = await this.db(this.tableName)
      .insert({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('id');
    
    return this.findById(id)!;
  }
  
  /**
   * Find employee by ID
   * 
   * @param id - Employee ID
   * @returns Employee record or null if not found
   */
  async findById(id: number): Promise<EmployeeRow | null> {
    const row = await this.db(this.tableName)
      .where({ id })
      .first();
    
    return row || null;
  }
  
  /**
   * Get salary metrics grouped by country
   * 
   * @returns Array of {country, avgSalary, minSalary, maxSalary, count}
   */
  async getSalaryMetricsByCountry() {
    return this.db(this.tableName)
      .select('country')
      .avg('gross_salary_cents as avgSalaryCents')
      .min('gross_salary_cents as minSalaryCents')
      .max('gross_salary_cents as maxSalaryCents')
      .count('* as employeeCount')
      .groupBy('country');
  }
}
```

### 5. **Test Structure**
```typescript
/**
 * Employee API Integration Tests
 * 
 * Tests the full HTTP request/response cycle
 * Uses in-memory SQLite for isolation
 * Resets database before each test
 */
import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/config/database';

describe('Employee API', () => {
  // Reset database before each test
  beforeEach(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
  });
  
  // Clean up after all tests
  afterAll(async () => {
    await db.destroy();
  });
  
  describe('POST /api/employees', () => {
    it('should create employee with valid data', async () => {
      const employeeData = {
        name: 'John Doe',
        email: 'john@example.com',
        jobTitle: 'Software Engineer',
        country: 'US',
        grossSalaryInCents: 10000000 // $100,000.00
      };
      
      const response = await request(app)
        .post('/api/employees')
        .send(employeeData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        name: employeeData.name,
        email: employeeData.email,
        grossSalaryInCents: employeeData.grossSalaryInCents
      });
    });
    
    it('should reject negative salary', async () => {
      const response = await request(app)
        .post('/api/employees')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          jobTitle: 'Engineer',
          country: 'US',
          grossSalaryInCents: -1000 // Invalid
        })
        .expect(400);
      
      expect(response.body.message).toContain('Salary cannot be negative');
    });
    
    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/employees')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          jobTitle: 'Engineer',
          country: 'US',
          grossSalaryInCents: 10000000
        })
        .expect(400);
      
      expect(response.body.message).toContain('Invalid email');
    });
  });
  
  describe('GET /api/employees/metrics/by-country', () => {
    beforeEach(async () => {
      // Seed test data
      await db('employees').insert([
        {
          name: 'Alice',
          email: 'alice@example.com',
          job_title: 'Engineer',
          country: 'US',
          gross_salary_cents: 10000000,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Bob',
          email: 'bob@example.com',
          job_title: 'Manager',
          country: 'US',
          gross_salary_cents: 15000000,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    });
    
    it('should return salary metrics by country', async () => {
      const response = await request(app)
        .get('/api/employees/metrics/by-country')
        .expect(200);
      
      expect(response.body).toContainEqual(
        expect.objectContaining({
          country: 'US',
          avgSalaryCents: 12500000, // Average of 10M and 15M
          employeeCount: '2'
        })
      );
    });
  });
});
```

## 🚨 Critical Rules

### DO's ✅
1. **Always use integer cents for money**: No floats for currency
2. **Validate at boundaries**: Zod schemas on all inputs
3. **Separate concerns**: Keep layers pure (controller/service/repository)
4. **Write tests first**: TDD approach for all features
5. **Log everything**: Use structured logging (Pino) with context
6. **Type everything**: No `any`, leverage TypeScript fully
7. **Document clearly**: JSDoc on all public functions
8. **Handle errors**: Custom error classes, never throw strings
9. **Isolate tests**: Each test gets clean database state
10. **Use migrations**: Never modify DB schema manually

### DON'Ts ❌
1. **No business logic in controllers**: Only HTTP handling
2. **No raw SQL strings**: Use Knex query builder
3. **No floating-point money math**: Always integers
4. **No skipping validation**: Every input must be validated
5. **No magic numbers**: Use named constants
6. **No console.log**: Use proper logger
7. **No ignoring TypeScript errors**: Fix them properly
8. **No weak tests**: Cover edge cases and errors
9. **No exposing internal errors**: Generic messages to clients
10. **No committing without tests**: Pre-commit hooks enforce this

## 🔒 Security Checklist

```typescript
// app.ts setup
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Too many requests, please try again later'
});
app.use('/api/', limiter);

// Request logging
app.use(pinoHttp({ logger }));

// Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
```

## 📊 Expected API Endpoints

```typescript
/**
 * Employee Management Routes
 */

// Create employee
POST /api/employees
Body: { name, email, jobTitle, country, grossSalaryInCents }
Response: 201 Created

// Get all employees
GET /api/employees?page=1&limit=10&country=US
Response: 200 OK

// Get employee by ID
GET /api/employees/:id
Response: 200 OK | 404 Not Found

// Update employee
PUT /api/employees/:id
Body: { name?, email?, jobTitle?, country?, grossSalaryInCents? }
Response: 200 OK | 404 Not Found

// Delete employee
DELETE /api/employees/:id
Response: 204 No Content | 404 Not Found

// Calculate salary with deductions
GET /api/employees/:id/salary
Response: 200 OK { grossSalaryInCents, deductions: [...], netSalaryInCents }

// Get salary metrics by country
GET /api/employees/metrics/by-country
Response: 200 OK [ { country, avgSalaryCents, minSalaryCents, maxSalaryCents, count } ]

// Get salary metrics by job title
GET /api/employees/metrics/by-job-title
Response: 200 OK [ { jobTitle, avgSalaryCents, count } ]
```

## 🎯 Implementation Order

1. **Setup Project**: Initialize npm, install dependencies, configure TypeScript/ESLint/Prettier
2. **Database Setup**: Knex config, initial migration (employees table)
3. **Models & Schemas**: Define types and Zod schemas
4. **Repository Layer**: Implement data access with tests
5. **Service Layer**: Business logic with unit tests
6. **Controller Layer**: HTTP handlers
7. **Integration Tests**: Full API tests with Supertest
8. **Middleware**: Error handling, validation, logging
9. **Security**: Helmet, CORS, rate limiting
10. **Git Hooks**: Husky + lint-staged + commitlint
11. **Documentation**: README with API docs and setup instructions

## 📖 Example Migration

```typescript
// migrations/20231201000000_create_employees_table.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('employees', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('job_title', 100).notNullable();
    table.string('country', 2).notNullable(); // ISO country code
    table.bigInteger('gross_salary_cents').notNullable(); // Store as integer cents
    table.timestamps(true, true); // created_at, updated_at
    
    // Indexes for common queries
    table.index('country');
    table.index('job_title');
    table.index('email');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('employees');
}
```

## 🚀 Success Criteria

- [ ] All tests pass with >90% coverage
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format`)
- [ ] Pre-commit hooks working (Husky)
- [ ] API documented with examples
- [ ] README includes setup instructions
- [ ] Environment variables documented
- [ ] All salary calculations use integer cents
- [ ] Input validation on all endpoints
- [ ] Error responses consistent
- [ ] Logging with request IDs
- [ ] Security headers configured

---

## 💡 Remember
- **Clarity over cleverness**: Write code future developers will thank you for
- **Test everything**: If it's not tested, it's broken
- **Document liberally**: Comments prevent confusion
- **Fail fast**: Validate early, return errors clearly
- **Keep it simple**: Don't over-engineer solutions

Good luck building a production-ready, maintainable Employee Salary Management API! 🎉
