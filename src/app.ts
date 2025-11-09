/**
 * Express Application Setup
 *
 * Configures Express app with:
 * - Security middleware (Helmet, CORS, Rate Limiting)
 * - Request logging
 * - Body parsing
 * - Routes
 * - Error handling
 *
 * @module app
 */
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import config from './config';
import { httpLogger } from './middleware/logger.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { createEmployeeRoutes } from './routes/employee.routes';
import { EmployeeController } from './controllers/employee.controller';
import { EmployeeService } from './services/employee.service';
import { SalaryService } from './services/salary.service';
import { EmployeeRepository } from './repositories/employee.repository';
// import db from './config/database';
import { getDb } from './config/database';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // ======================
  // Security Middleware
  // ======================

  // Helmet: Sets various HTTP headers for security
  app.use(helmet());

  // CORS: Configure cross-origin resource sharing
  app.use(
    cors({
      origin: config.security.allowedOrigins,
      credentials: true,
    })
  );

  // Rate limiting: Prevent abuse
  const limiter = rateLimit({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMaxRequests,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // ======================
  // Request Processing
  // ======================

  // HTTP request logging
  app.use(httpLogger);

  // Body parsing with size limits
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // ======================
  // Dependency Injection
  // ======================
  
  // Get database instance
  const db = getDb();
  // Initialize layers
  const employeeRepository = new EmployeeRepository(db);
  const salaryService = new SalaryService();
  const employeeService = new EmployeeService(employeeRepository, salaryService);
  const employeeController = new EmployeeController(employeeService);

  // ======================
  // Routes
  // ======================

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.env,
    });
  });

  // API routes
  app.use('/api/v1/employees', createEmployeeRoutes(employeeController));

  // ======================
  // Error Handling
  // ======================

  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

export const app = createApp();
