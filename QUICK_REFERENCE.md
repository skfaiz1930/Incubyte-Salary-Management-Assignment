# Quick Reference Guide - Code Patterns

## 🎯 Most Important Patterns

### 1. Money as Integer Cents Pattern

```typescript
// ✅ ALWAYS DO THIS
const salaryInCents = 5000055;  // $50,000.55
const taxRate = 15; // 15%
const taxInCents = Math.floor(salaryInCents * taxRate / 100);

// ❌ NEVER DO THIS
const salary = 50000.55;
const tax = salary * 0.15; // Floating point errors!

// Helper functions
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100);
};

export const centsToDollars = (cents: number): number => {
  return cents / 100;
};

export const formatCurrency = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};
```

### 2. Layer Separation Pattern

```typescript
// ============================================
// CONTROLLER LAYER - HTTP Only
// ============================================
/**
 * Handles HTTP request/response
 * No business logic here!
 */
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}
  
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extract data from request
      const data = req.body;
      
      // 2. Call service layer
      const employee = await this.employeeService.create(data);
      
      // 3. Format response
      res.status(201).json({
        status: 'success',
        data: employee
      });
    } catch (error) {
      next(error); // Pass to error middleware
    }
  }
}

// ============================================
// SERVICE LAYER - Business Logic
// ============================================
/**
 * Contains all business rules
 * Orchestrates operations, no HTTP knowledge
 */
export class EmployeeService {
  constructor(
    private employeeRepo: EmployeeRepository,
    private salaryService: SalaryService
  ) {}
  
  async create(data: CreateEmployeeInput): Promise<Employee> {
    // 1. Business validation
    const existing = await this.employeeRepo.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already exists');
    }
    
    // 2. Apply business rules
    if (data.grossSalaryInCents < 100000) { // Min $1,000
      throw new ValidationError('Minimum salary is $1,000');
    }
    
    // 3. Delegate to repository
    const employee = await this.employeeRepo.create({
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    return employee;
  }
}

// ============================================
// REPOSITORY LAYER - Data Access
// ============================================
/**
 * Only database operations
 * No business logic, just CRUD
 */
export class EmployeeRepository {
  constructor(private db: Knex) {}
  
  async create(data: EmployeeRow): Promise<EmployeeRow> {
    const [id] = await this.db('employees')
      .insert(data)
      .returning('id');
    
    return this.findById(id)!;
  }
  
  async findByEmail(email: string): Promise<EmployeeRow | null> {
    return this.db('employees')
      .where({ email })
      .first() || null;
  }
}
```

### 3. Validation Pattern (Zod)

```typescript
import { z } from 'zod';

// Define schema
export const createEmployeeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().toLowerCase(),
    jobTitle: z.string().min(2).max(100),
    country: z.enum(['US', 'UK', 'IN', 'CA']),
    grossSalaryInCents: z.number()
      .int()
      .min(100000) // $1,000 minimum
      .max(100000000000) // $1B maximum
  })
});

// Extract TypeScript type
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>['body'];

// Validation middleware
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
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};

// Usage in routes
router.post('/employees', 
  validate(createEmployeeSchema),
  employeeController.create
);
```

### 4. Error Handling Pattern

```typescript
// ============================================
// ERROR CLASSES
// ============================================
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
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

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}

// ============================================
// ERROR MIDDLEWARE
// ============================================
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query
    }
  });
  
  // Operational errors (expected)
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
    return;
  }
  
  // Programming errors (unexpected)
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.url} not found`
  });
};

// Usage
throw new NotFoundError('Employee', id);
throw new ValidationError('Salary must be positive');
throw new ConflictError('Email already registered');
```

### 5. Testing Pattern

```typescript
// ============================================
// INTEGRATION TEST STRUCTURE
// ============================================
import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/config/database';

describe('Employee API', () => {
  // Setup fresh database before each test
  beforeEach(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
  });
  
  // Cleanup after all tests
  afterAll(async () => {
    await db.destroy();
  });
  
  describe('POST /api/employees', () => {
    const validEmployee = {
      name: 'John Doe',
      email: 'john@example.com',
      jobTitle: 'Engineer',
      country: 'US',
      grossSalaryInCents: 10000000
    };
    
    it('should create employee with valid data', async () => {
      const response = await request(app)
        .post('/api/employees')
        .send(validEmployee)
        .expect(201);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        id: expect.any(Number),
        name: validEmployee.name,
        email: validEmployee.email
      });
    });
    
    it('should reject duplicate email', async () => {
      // Create first employee
      await request(app)
        .post('/api/employees')
        .send(validEmployee)
        .expect(201);
      
      // Try to create duplicate
      const response = await request(app)
        .post('/api/employees')
        .send(validEmployee)
        .expect(409);
      
      expect(response.body.message).toContain('Email already exists');
    });
    
    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/employees')
        .send({ ...validEmployee, email: 'invalid' })
        .expect(400);
      
      expect(response.body.message).toContain('Validation failed');
    });
  });
});

// ============================================
// UNIT TEST STRUCTURE
// ============================================
import { EmployeeService } from '../../src/services/employee.service';
import { EmployeeRepository } from '../../src/repositories/employee.repository';
import { ConflictError, ValidationError } from '../../src/utils/errors';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let mockRepo: jest.Mocked<EmployeeRepository>;
  
  beforeEach(() => {
    // Create mock repository
    mockRepo = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn()
    } as any;
    
    service = new EmployeeService(mockRepo);
  });
  
  describe('create', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      jobTitle: 'Engineer',
      country: 'US',
      grossSalaryInCents: 10000000
    };
    
    it('should create employee when email is unique', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ id: 1, ...validData } as any);
      
      const result = await service.create(validData);
      
      expect(mockRepo.findByEmail).toHaveBeenCalledWith(validData.email);
      expect(mockRepo.create).toHaveBeenCalled();
      expect(result.email).toBe(validData.email);
    });
    
    it('should throw ConflictError when email exists', async () => {
      mockRepo.findByEmail.mockResolvedValue({ id: 1 } as any);
      
      await expect(service.create(validData))
        .rejects
        .toThrow(ConflictError);
    });
    
    it('should throw ValidationError when salary is too low', async () => {
      const lowSalary = { ...validData, grossSalaryInCents: 50000 };
      mockRepo.findByEmail.mockResolvedValue(null);
      
      await expect(service.create(lowSalary))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

### 6. Database Query Pattern

```typescript
// ============================================
// BASIC QUERIES
// ============================================

// Create
async create(data: EmployeeRow): Promise<EmployeeRow> {
  const [id] = await this.db('employees')
    .insert(data)
    .returning('id');
  
  return this.findById(id)!;
}

// Read one
async findById(id: number): Promise<EmployeeRow | null> {
  return this.db('employees')
    .where({ id })
    .first() || null;
}

// Read many with filters
async findAll(
  filters: { country?: string; jobTitle?: string },
  pagination: { page: number; limit: number }
): Promise<EmployeeRow[]> {
  const query = this.db('employees');
  
  // Apply filters conditionally
  if (filters.country) {
    query.where('country', filters.country);
  }
  if (filters.jobTitle) {
    query.where('job_title', filters.jobTitle);
  }
  
  // Apply pagination
  const offset = (pagination.page - 1) * pagination.limit;
  query.limit(pagination.limit).offset(offset);
  
  return query;
}

// Update
async update(id: number, data: Partial<EmployeeRow>): Promise<EmployeeRow> {
  await this.db('employees')
    .where({ id })
    .update({
      ...data,
      updated_at: new Date()
    });
  
  const updated = await this.findById(id);
  if (!updated) {
    throw new NotFoundError('Employee', id);
  }
  return updated;
}

// Delete
async delete(id: number): Promise<boolean> {
  const deleted = await this.db('employees')
    .where({ id })
    .delete();
  
  return deleted > 0;
}

// ============================================
// AGGREGATION QUERIES
// ============================================

async getSalaryMetricsByCountry() {
  return this.db('employees')
    .select('country')
    .avg('gross_salary_cents as avgSalaryCents')
    .min('gross_salary_cents as minSalaryCents')
    .max('gross_salary_cents as maxSalaryCents')
    .count('* as employeeCount')
    .groupBy('country')
    .orderBy('country');
}

async getSalaryMetricsByJobTitle() {
  return this.db('employees')
    .select('job_title as jobTitle')
    .avg('gross_salary_cents as avgSalaryCents')
    .count('* as employeeCount')
    .groupBy('job_title')
    .orderBy('avgSalaryCents', 'desc');
}

// Count with filters
async count(filters: { country?: string }): Promise<number> {
  const query = this.db('employees').count('* as count');
  
  if (filters.country) {
    query.where('country', filters.country);
  }
  
  const result = await query.first();
  return Number(result?.count || 0);
}
```

### 7. Logging Pattern

```typescript
import pino from 'pino';
import pinoHttp from 'pino-http';

// ============================================
// LOGGER CONFIGURATION
// ============================================
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined
});

// HTTP request logger
export const httpLogger = pinoHttp({
  logger,
  autoLogging: true,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  }
});

// ============================================
// USAGE IN CODE
// ============================================

// Info logging
logger.info('Server started on port 3000');
logger.info({ employeeId: 123 }, 'Employee created');

// Warning logging
logger.warn({ email: 'john@example.com' }, 'Duplicate email attempt');

// Error logging
logger.error({ err, employeeId: 123 }, 'Failed to create employee');

// In service layer
export class EmployeeService {
  async create(data: CreateEmployeeInput): Promise<Employee> {
    logger.info({ email: data.email }, 'Creating new employee');
    
    try {
      const employee = await this.employeeRepo.create(data);
      logger.info({ employeeId: employee.id }, 'Employee created successfully');
      return employee;
    } catch (error) {
      logger.error({ err: error, email: data.email }, 'Employee creation failed');
      throw error;
    }
  }
}
```

### 8. App Setup Pattern

```typescript
// ============================================
// APP.TS - Express Setup
// ============================================
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { httpLogger } from './utils/logger';
import employeeRoutes from './routes/employee.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export const createApp = () => {
  const app = express();
  
  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
  }));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP'
  });
  app.use('/api/', limiter);
  
  // Logging
  app.use(httpLogger);
  
  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // API routes
  app.use('/api/employees', employeeRoutes);
  
  // Error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);
  
  return app;
};

// ============================================
// SERVER.TS - Server Start
// ============================================
import { createApp } from './app';
import { db } from './config/database';
import { logger } from './utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    logger.info('Database connected');
    
    // Run migrations
    await db.migrate.latest();
    logger.info('Migrations completed');
    
    // Start server
    const app = createApp();
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
    
    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(async () => {
        await db.destroy();
        logger.info('Server closed');
        process.exit(0);
      });
    };
    
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
```

## 🚨 Common Pitfalls to Avoid

1. **Floating Point Money**: Always use integer cents
2. **Business Logic in Controllers**: Keep controllers thin
3. **Missing Validation**: Validate all inputs with Zod
4. **Raw SQL Strings**: Use Knex query builder
5. **console.log**: Use proper logger
6. **Ignoring TypeScript Errors**: Fix them, don't use `any`
7. **Weak Tests**: Test edge cases and error scenarios
8. **Exposing Internal Errors**: Generic messages to clients
9. **Shared Test State**: Isolate each test with fresh DB
10. **Missing Error Handling**: Always handle async errors

## 📋 Pre-Commit Checklist

Before every commit:
- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] No lint errors: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] Conventional commit message

## 🎯 Key Commands

```bash
# Start fresh
npm run migrate:rollback && npm run migrate:latest

# Full check before commit
npm run typecheck && npm run lint && npm test

# Watch mode during development
npm run test:watch

# Check everything is production-ready
npm run build && npm start
```
