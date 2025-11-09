# 🌟 Incubyte Salary Management API

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express)](https://expressjs.com/)
[![Jest](https://img.shields.io/badge/Jest-29.5.0-C21325?logo=jest)](https://jestjs.io/)
[![Test Coverage](https://img.shields.io/badge/Coverage-75.8%25-44CC11?logo=jest)](https://github.com/gotwarlost/istanbul)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Project Overview

A robust, production-ready Employee Salary Management API built with Node.js, TypeScript, and Express. This API provides comprehensive employee data management with advanced features like salary calculations, metrics, and soft deletes. Built with TDD, clean architecture, and best practices.

## 📋 Table of Contents

- [🚀 Project Overview](#-project-overview)
  - [🔑 Key Features](#-key-features)
  - [🛠 Technology Stack](#-technology-stack)
- [🏗 Architecture](#-architecture)
  - [🔄 Data Flow](#-data-flow)
- [🧪 Test-Driven Development (TDD)](#-test-driven-development-tdd-approach)
  - [🔴 🟢 🔄 Red-Green-Refactor Cycle](#-red-green-refactor-cycle)
  - [📊 Test Coverage](#-test-coverage)
- [🤖 AI-Assisted Development](#-ai-assisted-development)
  - [🛠 Initial Setup & Boilerplate](#-initial-setup--boilerplate)
  - [🐛 Problem Solving](#-problem-solving)
  - [📈 Test Coverage Improvement](#-test-coverage-improvement)
  - [📚 Documentation](#-documentation)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [📚 API Documentation](#-api-documentation)
  - [Base URL](#base-url)
  - [Endpoints](#endpoints)
- [🧪 Testing](#-testing)
  - [Running Tests](#running-tests)
  - [Test Coverage](#test-coverage)
- [🏗 Project Structure](#-project-structure)
- [🛠 Development Workflow](#-development-workflow)
  - [Branching Strategy](#branching-strategy)
  - [Commit Messages](#commit-messages)
  - [Code Reviews](#code-reviews)
- [🏆 Challenges & Solutions](#-challenges--solutions)
- [📈 Future Enhancements](#-future-enhancements)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

### 🔑 Key Features

- **RESTful API** with versioning (v1)
- **CRUD Operations** for employee management
- **Soft Delete** functionality with audit trail
- **Country-specific** salary calculations (US, UK, IN, DE, AU)
- **Advanced Metrics** and aggregations
- **Pagination** and filtering
- **Input Validation** with Zod
- **Comprehensive Error Handling**
- **Security** (Helmet, CORS, Rate Limiting)
- **Request Logging** with Winston
- **Database Migrations** with Knex
- **Test Coverage** (75.8% branches, 88%+ statements)

## 🛠️ Tech Stack

### Runtime & Framework

- **Node.js** 20 LTS
- **TypeScript** 5.3+
- **Express** 4.18

### Database

- **SQLite** (with Knex migrations and query builder)

### Testing

- **Jest** + **Supertest** (integration tests)
- **ts-jest** (TypeScript support)

### Validation & Security

- **Zod** (schema validation)
- **Helmet** (security headers)
- **CORS** (cross-origin requests)
- **express-rate-limit** (rate limiting)

### Logging & Config

- **Pino** (structured logging)
- **dotenv** (environment variables)

### Code Quality

- **ESLint** (linting)
- **Prettier** (formatting)
- **Husky** (git hooks)
- **lint-staged** (pre-commit checks)
- **Commitlint** (conventional commits)

## 🏗 Architecture

The application follows a clean, layered architecture with clear separation of concerns:

```
src/
├── config/         # Configuration and database setup
├── controllers/    # Request handlers
├── services/       # Business logic
├── repositories/   # Data access layer
├── models/         # Domain models
├── routes/         # Route definitions
├── middleware/     # Custom middleware
├── schemas/        # Validation schemas
└── utils/          # Utilities and helpers
```

```
┌─────────────────────────────────────────────┐
│           Controller Layer                  │
│  (HTTP handling, request/response only)     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│            Service Layer                    │
│  (Business logic, orchestration)            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          Repository Layer                   │
│  (Database access via query builder)        │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              Database                       │
│  (SQLite with Knex migrations)              │
└─────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Money as Integer Cents**: All salary values stored as cents to avoid floating-point precision errors
2. **Repository Pattern**: Isolates database logic for easy testing and maintenance
3. **Validation at Boundaries**: Zod schemas validate all inputs before they reach business logic
4. **Type Safety**: Strict TypeScript with no `any` types
5. **Test-Driven Development**: Tests written before implementation

### 🔄 Data Flow

1. **Request** → 2. **Route** → 3. **Controller** → 4. **Service** → 5. **Repository** → 6. **Database**

## 🧪 Test-Driven Development (TDD) Approach

### 🔴 🟢 🔄 Red-Green-Refactor Cycle

1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass the test
3. **Refactor**: Improve code while keeping tests green

### Example: Implementing Soft Delete

1. **Red**: Wrote test expecting soft-deleted employees to be excluded from queries
2. **Green**: Added `deletedAt` column and updated queries to filter out soft-deleted records
3. **Refactor**: Extracted soft delete logic to base repository

### Test Coverage

- **Unit Tests**: 60+ tests covering services, repositories, and utilities
- **Integration Tests**: 40+ tests covering API endpoints
- **Test Coverage**: 75.8% branches, 88%+ statements

## 🤖 AI-Assisted Development

### 🛠 Initial Setup & Boilerplate

- Used AI to generate initial project structure and configuration
- Automated setup of TypeScript, ESLint, Prettier, and Jest

### 🐛 Problem Solving

#### Database Isolation in Tests

- **Challenge**: Tests were interfering with each other due to shared database state
- **AI Suggestion**: Implemented dependency injection for database connections
- **Result**: Each test suite now runs in complete isolation

#### TypeScript Readonly Properties

- **Challenge**: Couldn't mock readonly properties in tests
- **AI Suggestion**: Used TypeScript utility types to create mutable versions for testing
- **Result**: Improved testability without compromising type safety

### 📈 Test Coverage Improvement

- **Initial Coverage**: 60.8%
- **Current Coverage**: 75.8% (branches)
- **AI-Assisted**: Identified untested branches and edge cases

### 📚 Documentation

- AI-generated API documentation
- Consistent commit messages and test descriptions
- Clear error messages and logging

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x
- npm 9.x
- SQLite3

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/employee-management-api.git
cd employee-management-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run migrations
npm run migrate:latest

# Start development server
npm run dev

# Run tests
npm test
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=./data/employees.db
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Run database migrations**

```bash
npm run migrate:latest
```

**Start the development server**

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Quick Health Check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Endpoints

```http
POST /api/employees
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "jobTitle": "Software Engineer",
  "country": "US",
  "grossSalaryInCents": 10000000
}
```

**Response:** `201 Created`

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "jobTitle": "Software Engineer",
    "country": "US",
    "grossSalaryInCents": 10000000,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation:**

- `name`: 2-100 characters
- `email`: Valid email format (unique)
- `jobTitle`: 2-100 characters
- `country`: Enum ['US', 'UK', 'IN', 'CA']
- `grossSalaryInCents`: Integer, 100000 - 100000000000 (min $1,000, max $1B)

---

#### 2. Get All Employees

```http
GET /api/employees?page=1&limit=10&country=US&jobTitle=Engineer
```

**Query Parameters:**

- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10, max 100
- `country` (optional): Filter by country
- `jobTitle` (optional): Filter by job title

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "employees": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "jobTitle": "Software Engineer",
        "country": "US",
        "grossSalaryInCents": 10000000
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

#### 3. Get Employee by ID

```http
GET /api/employees/:id
```

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "jobTitle": "Software Engineer",
    "country": "US",
    "grossSalaryInCents": 10000000
  }
}
```

**Error Response:** `404 Not Found`

```json
{
  "status": "error",
  "message": "Employee with id 999 not found"
}
```

---

#### 4. Update Employee

```http
PUT /api/employees/:id
```

**Request Body:** (all fields optional)

```json
{
  "name": "John Smith",
  "jobTitle": "Senior Engineer",
  "grossSalaryInCents": 12000000
}
```

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "john.doe@example.com",
    "jobTitle": "Senior Engineer",
    "country": "US",
    "grossSalaryInCents": 12000000
  }
}
```

---

#### 5. Delete Employee (Soft Delete)

```http
DELETE /api/employees/:id
```

**Response:** `204 No Content`

---

#### 6. Calculate Employee Salary

```http
GET /api/employees/:id/salary
```

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "employeeId": 1,
    "name": "John Doe",
    "grossSalaryInCents": 10000000,
    "deductions": [
      {
        "type": "tax",
        "amountInCents": 2500000,
        "description": "Federal Tax (25%)"
      },
      {
        "type": "insurance",
        "amountInCents": 500000,
        "description": "Health Insurance (5%)"
      },
      {
        "type": "retirement",
        "amountInCents": 500000,
        "description": "401(k) Contribution (5%)"
      }
    ],
    "totalDeductionsInCents": 3500000,
    "netSalaryInCents": 6500000,
    "formatted": {
      "grossSalary": "$100,000.00",
      "totalDeductions": "$35,000.00",
      "netSalary": "$65,000.00"
    }
  }
}
```

---

#### 7. Get Salary Metrics

```http
GET /api/employees/salary-metrics
```

**Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "byCountry": [
      {
        "country": "IN",
        "avgSalaryCents": 40400002,
        "minSalaryCents": 1000000,
        "maxSalaryCents": 100000011,
        "employeeCount": 5
      },
      {
        "country": "UK",
        "avgSalaryCents": 5000000,
        "minSalaryCents": 5000000,
        "maxSalaryCents": 5000000,
        "employeeCount": 1
      },
      {
        "country": "US",
        "avgSalaryCents": 38333337,
        "minSalaryCents": 5000000,
        "maxSalaryCents": 100000011,
        "employeeCount": 3
      }
    ],
    "byJobTitle": [
      {
        "jobTitle": "Associate",
        "avgSalaryCents": 15000000,
        "minSalaryCents": 15000000,
        "maxSalaryCents": 15000000,
        "employeeCount": 1
      },
      {
        "jobTitle": "SDE",
        "avgSalaryCents": 50500006,
        "minSalaryCents": 1000000,
        "maxSalaryCents": 100000011,
        "employeeCount": 2
      },
      {
        "jobTitle": "Saled Head",
        "avgSalaryCents": 63000006,
        "minSalaryCents": 26000000,
        "maxSalaryCents": 100000011,
        "employeeCount": 2
      },
      {
        "jobTitle": "Sales",
        "avgSalaryCents": 5000000,
        "minSalaryCents": 5000000,
        "maxSalaryCents": 5000000,
        "employeeCount": 1
      },
      {
        "jobTitle": "Software Enginee",
        "avgSalaryCents": 10000000,
        "minSalaryCents": 10000000,
        "maxSalaryCents": 10000000,
        "employeeCount": 1
      },
      {
        "jobTitle": "Tech",
        "avgSalaryCents": 32500000,
        "minSalaryCents": 5000000,
        "maxSalaryCents": 60000000,
        "employeeCount": 2
      }
    ]
  }
}
```

---

### Error Responses

All errors follow a consistent format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

**Status Codes:**

- `400 Bad Request`: Invalid input/validation error
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource (e.g., email already exists)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Unexpected server error

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm test -- --coverage
```

### View Coverage Report

```bash
npm test
# Open coverage/lcov-report/index.html in browser
```

### Test Coverage

```
----------------|---------|----------|---------|---------|-------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------|---------|----------|---------|---------|-------------------
All files       |   91.79 |    74.19 |   87.5  |   91.46 |
----------------|---------|----------|---------|---------|-------------------
```

### Test Structure

```
tests/
├── integration/          # API integration tests
│   └── employee.test.ts
├── unit/                 # Service/utility unit tests
│   ├── employee.service.test.ts
│   └── salary.service.test.ts
├── fixtures/             # Test data
│   └── employees.ts
└── setup.ts              # Test configuration
```

## 🏗 Project Structure

```
.
├── src/                    # Source files
│   ├── config/            # Configuration
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── repositories/      # Data access
│   ├── models/            # Data models
│   ├── middleware/        # Express middleware
│   ├── routes/            # Route definitions
│   ├── schemas/           # Validation schemas
│   └── utils/             # Utility functions
├── tests/                 # Test files
│   ├── integration/       # API integration tests
│   └── unit/              # Unit tests
├── data/                  # Database files
└── migrations/            # Database migrations
```

## 🛠 Development Workflow

1. **Branching Strategy**
   - `main`: Production-ready code
   - `develop`: Integration branch for features
   - `feature/*`: New features
   - `fix/*`: Bug fixes

2. **Commit Messages**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `test:` Adding tests
   - `refactor:` Code refactoring
   - `chore:` Build process or tooling changes

3. **Code Reviews**
   - All changes require PR review
   - Must pass all tests
   - Must maintain or increase test coverage

## 🏆 Challenges & Solutions

### Challenge 1: Database Isolation in Tests

**Problem**: Tests were interfering with each other due to shared database state.
**Solution**: Implemented dependency injection for database connections and proper test cleanup.

### Challenge 2: Type Safety with Knex

**Problem**: Knex queries were losing TypeScript types.
**Solution**: Created strongly-typed repositories with proper type inference.

### Challenge 3: Test Coverage

**Problem**: Initial coverage was below target (60.8%).
**Solution**: Added targeted unit tests and improved test data factories.

## 📈 Future Enhancements

- [ ] Authentication & Authorization
- [ ] Rate limiting per user
- [ ] Caching layer
- [ ] Admin dashboard
- [ ] Export functionality (CSV, Excel)
- [ ] Performance monitoring
- [ ] Swagger/OpenAPI documentation
- [ ] Containerization with Docker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built as part of the Incubyte TDD Assessment
- Follows [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) principles
- Implements [SOLID](https://en.wikipedia.org/wiki/SOLID) design patterns
- Uses [Conventional Commits](https://www.conventionalcommits.org/) specification

---

<div align="center">
  Made by Faizan | 🚀 Powered by TypeScript & Node.js
</div>
