/**
 * Test Environment Setup
 *
 * Configures Jest test environment
 * Sets up in-memory database for testing
 *
 * @module tests/setup
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';
process.env.LOG_LEVEL = 'silent';
