/**
 * Application Configuration
 *
 * Centralized configuration management
 * Loads environment variables with validation and defaults
 *
 * @module config
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config();

/**
 * Application configuration object
 * All configuration should be accessed through this object
 */
const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  database: {
    client: process.env.DATABASE_CLIENT || 'sqlite3',
    path: path.join(process.cwd(), 'data', 'employees.db'),
  },

  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;

/**
 * Validate required configuration
 */
export function validateConfig(): void {
  const required = ['NODE_ENV', 'PORT'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default config;
