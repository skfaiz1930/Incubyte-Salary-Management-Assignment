/**
 * Test Environment Setup
 *
 * Configures Jest test environment
 * Sets up in-memory database for testing
 *
 * @module tests/setup
 */

// Set test environment
process.env.NODE_ENV = 'development';
process.env.DATABASE_PATH = 'data/employees.db';
process.env.LOG_LEVEL = 'info';
