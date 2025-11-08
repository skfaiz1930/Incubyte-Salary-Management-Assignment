# Implementation Checklist

## Phase 1: Project Setup ⚙️

### 1.1 Initialize Project
- [x] Run `npm init -y`
- [x] Install production dependencies
  ```bash
  npm install express knex sqlite3 zod helmet cors express-rate-limit pino pino-http dotenv
  ```
- [x] Install dev dependencies
  ```bash
  npm install -D typescript @types/node @types/express @types/cors @types/jest @types/supertest ts-node ts-node-dev ts-jest jest supertest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-airbnb-base eslint-config-prettier prettier husky lint-staged @commitlint/cli @commitlint/config-conventional
  ```

### 1.2 Configuration Files
- [x] Create `tsconfig.json`
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "commonjs",
      "lib": ["ES2022"],
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "resolveJsonModule": true,
      "declaration": true,
      "declarationMap": true,
      "sourceMap": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "tests"]
  }
  ```

- [x] Create `jest.config.js`
  ```javascript
  module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
      '!src/server.ts'
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  };
  ```

- [x] Create `.eslintrc.js`
  ```javascript
  module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'airbnb-base',
      'plugin:@typescript-eslint/recommended',
      'prettier'
    ],
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error'
    }
  };
  ```

- [x] Create `.prettierrc`
  ```json
  {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2
  }
  ```

- [x] Create `.env.example`
  ```
  NODE_ENV=development
  PORT=3000
  DATABASE_PATH=./data/employees.db
  LOG_LEVEL=info
  ALLOWED_ORIGINS=http://localhost:3000
  ```

- [x] Create `.gitignore`
  ```
  node_modules/
  dist/
  coverage/
  .env
  *.db
  *.log
  .DS_Store
  ```

## Phase 2: Database Layer 🗄️

### 2.1 Knex Configuration
- [x] Create `knexfile.ts`
  ```typescript
  import type { Knex } from 'knex';
  import * as dotenv from 'dotenv';
  
  dotenv.config();
  
  const config: { [key: string]: Knex.Config } = {
    development: {
      client: 'sqlite3',
      connection: {
        filename: process.env.DATABASE_PATH || './data/employees.db'
      },
      useNullAsDefault: true,
      migrations: {
        directory: './src/db/migrations'
      }
    },
    test: {
      client: 'sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
      migrations: {
        directory: './src/db/migrations'
      }
    },
    production: {
      client: 'sqlite3',
      connection: {
        filename: process.env.DATABASE_PATH || './data/employees.db'
      },
      useNullAsDefault: true,
      migrations: {
        directory: './dist/db/migrations'
      }
    }
  };
  
  export default config;
  ```

- [x] Create `src/config/database.ts`
  ```typescript
  import knex from 'knex';
  import config from '../../knexfile';
  
  const environment = process.env.NODE_ENV || 'development';
  export const db = knex(config[environment]);
  ```

### 2.2 Migrations
- [x] Create employees table migration
  ```bash
  npx knex migrate:make create_employees_table
  ```
- [x] Implement up/down functions with proper schema
- [x] Test migration: `npm run migrate:latest`
- [x] Test rollback: `npm run migrate:rollback`

## Phase 3: Models & Schemas 📝

### 3.1 Type Definitions
- [x] Create `src/models/employee.model.ts`
  - Employee interface
  - EmployeeRow (DB representation)
  - CreateEmployeeDTO
  - UpdateEmployeeDTO

### 3.2 Validation Schemas
- [x] Create `src/schemas/employee.schema.ts`
  - createEmployeeSchema
  - updateEmployeeSchema
  - getEmployeeByIdSchema
  - queryEmployeesSchema

## Phase 4: Repository Layer 💾

### 4.1 Employee Repository
- [x] Create `src/repositories/employee.repository.ts`
- [x] Implement methods:
  - [x] `create(data): Promise<EmployeeRow>`
  - [x] `findById(id): Promise<EmployeeRow | null>`
  - [x] `findAll(filters, pagination): Promise<EmployeeRow[]>`
  - [x] `findByEmail(email): Promise<EmployeeRow | null>`
  - [x] `update(id, data): Promise<EmployeeRow>`
  - [x] `delete(id): Promise<boolean>`
  - [x] `getSalaryMetricsByCountry(): Promise<Metric[]>`
  - [x] `getSalaryMetricsByJobTitle(): Promise<Metric[]>`
  - [x] `emailExists(email, excludeId): Promise<boolean>`

### 4.2 Repository Tests
- [x] Create `tests/unit/employee.repository.test.ts`
- [x] Test all CRUD operations
- [x] Test edge cases (not found, duplicates, etc.)
- [x] Test metrics calculations

## Phase 5: Service Layer 🔧

### 5.1 Employee Service
- [x] Create `src/services/employee.service.ts`
- [x] Implement business logic:
  - [x] Create employee (with validation)
  - [x] Get employee(s)
  - [x] Update employee
  - [x] Delete employee
  - [x] Check email uniqueness

### 5.2 Salary Service
- [x] Create `src/services/salary.service.ts`
- [x] Implement deduction rules:
  - [x] Tax calculation (progressive brackets)
  - [x] Insurance deduction
  - [x] Retirement deduction
  - [x] `calculateNetSalary(grossInCents, country): number`
  - [x] `getDeductionBreakdown(grossInCents, country): Deduction[]`

### 5.3 Service Tests
- [x] Create `tests/unit/employee.service.test.ts`
- [x] Create `tests/unit/salary.service.test.ts`
- [x] Test all business logic
- [x] Test edge cases and validations
- [x] Test salary calculations with various inputs

## Phase 6: Controller Layer 🎮

### 6.1 Employee Controller
- [ ] Create `src/controllers/employee.controller.ts`
- [ ] Implement handlers:
  - [ ] `createEmployee`
  - [ ] `getEmployees`
  - [ ] `getEmployeeById`
  - [ ] `updateEmployee`
  - [ ] `deleteEmployee`
  - [ ] `getEmployeeSalary`
  - [ ] `getMetricsByCountry`
  - [ ] `getMetricsByJobTitle`

### 6.2 Routes
- [ ] Create `src/routes/employee.routes.ts`
- [ ] Define all API endpoints with validation middleware
- [ ] Apply rate limiting

## Phase 7: Middleware 🛡️

### 7.1 Error Middleware
- [ ] Create `src/middleware/error.middleware.ts`
  - [ ] Global error handler
  - [ ] 404 handler
  - [ ] Custom error classes (AppError, NotFoundError, ValidationError)

### 7.2 Validation Middleware
- [ ] Create `src/middleware/validation.middleware.ts`
  - [ ] Zod validation wrapper
  - [ ] Error formatting

### 7.3 Logger Middleware
- [ ] Create `src/utils/logger.ts`
  - [ ] Pino logger configuration
  - [ ] Request logging middleware

## Phase 8: App Setup 🚀

### 8.1 Express App
- [ ] Create `src/app.ts`
  - [ ] Initialize Express
  - [ ] Apply security middleware (helmet, cors)
  - [ ] Apply rate limiting
  - [ ] Apply logger
  - [ ] Mount routes
  - [ ] Apply error handlers

### 8.2 Server
- [ ] Create `src/server.ts`
  - [ ] Start server
  - [ ] Graceful shutdown
  - [ ] Database connection handling

## Phase 9: Integration Tests 🧪

### 9.1 Test Setup
- [ ] Create `tests/setup.ts`
  - [ ] Database initialization
  - [ ] Cleanup utilities

### 9.2 API Tests
- [ ] Create `tests/integration/employee.test.ts`
- [ ] Test all endpoints:
  - [ ] POST /api/employees (success & validation errors)
  - [ ] GET /api/employees (with filters & pagination)
  - [ ] GET /api/employees/:id (success & 404)
  - [ ] PUT /api/employees/:id (success, validation, 404)
  - [ ] DELETE /api/employees/:id (success & 404)
  - [ ] GET /api/employees/:id/salary
  - [ ] GET /api/employees/metrics/by-country
  - [ ] GET /api/employees/metrics/by-job-title

### 9.3 Test Coverage
- [ ] Run `npm test` - ensure all tests pass
- [ ] Check coverage report - aim for >90%
- [ ] Fix any gaps in coverage

## Phase 10: Documentation 📚

### 10.1 API Documentation
- [ ] Update `README.md` with:
  - [ ] Project description
  - [ ] Features list
  - [ ] Tech stack
  - [ ] Prerequisites
  - [ ] Installation steps
  - [ ] Environment variables
  - [ ] Running the app
  - [ ] Running tests
  - [ ] API endpoints with examples
  - [ ] Project structure

### 10.2 Code Documentation
- [ ] Add JSDoc comments to all public functions
- [ ] Document complex algorithms
- [ ] Add inline comments for business logic

## Phase 11: Quality Checks ✅

### 11.1 Pre-deployment Checklist
- [ ] Run `npm run typecheck` - no errors
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run format:check` - all files formatted
- [ ] Run `npm test` - all tests pass with >90% coverage
- [ ] Test pre-commit hook works
- [ ] Test commit-msg hook enforces conventional commits
- [ ] Manual testing of all API endpoints
- [ ] Check security headers in responses
- [ ] Verify rate limiting works
- [ ] Test error responses are consistent
- [ ] Verify logging outputs properly

### 11.2 Security Audit
- [ ] No sensitive data in logs
- [ ] No API keys hardcoded
- [ ] Input validation on all endpoints
- [ ] SQL injection protected (using query builder)
- [ ] CORS configured properly
- [ ] Rate limiting active
- [ ] Helmet security headers set

### 11.3 Performance Check
- [ ] Database queries optimized (indexes)
- [ ] No N+1 query problems
- [ ] Pagination implemented for list endpoints
- [ ] Response times acceptable

## Phase 12: Deployment Preparation 🌐

### 12.1 Production Configuration
- [ ] Create production `.env` template
- [ ] Document deployment steps
- [ ] Create build script
- [ ] Test production build: `npm run build && npm start`

### 12.2 Monitoring & Logging
- [ ] Verify structured logging works
- [ ] Add health check endpoint
- [ ] Document log levels and formats

---

## Success Metrics 🎯

- [ ] **Code Quality**: TypeScript strict mode, no linting errors
- [ ] **Test Coverage**: >90% for services and repositories
- [ ] **Documentation**: All public APIs documented with JSDoc
- [ ] **Security**: All security middleware active
- [ ] **Performance**: All endpoints respond <100ms (for typical queries)
- [ ] **Maintainability**: Clear separation of concerns, DRY principles

---

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server with hot reload

# Testing
npm test                       # Run all tests with coverage
npm run test:watch            # Watch mode
npm run test:integration      # Integration tests only
npm run test:unit             # Unit tests only

# Database
npm run migrate:latest        # Run migrations
npm run migrate:rollback      # Rollback last migration
npm run migrate:make <name>   # Create new migration

# Code Quality
npm run lint                  # Check linting
npm run lint:fix             # Fix linting issues
npm run format               # Format code
npm run typecheck            # TypeScript type checking

# Build
npm run build                # Build for production
npm start                    # Run production build
```

---

## Notes
- Work through checklist sequentially
- Don't skip tests - they save time later
- Commit frequently with conventional commit messages
- Keep PRs/commits small and focused
- Review code before marking items complete
