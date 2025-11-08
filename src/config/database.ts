/**
 * Database Configuration
 *
 * Knex database connection setup for SQLite
 * Configures connection pooling and foreign key constraints
 *
 * @module config/database
 */
import knex, { Knex } from 'knex';
import config from './index';
import logger from '../utils/logger';

/**
 * Knex configuration based on environment
 */
const knexConfig: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: config.database.path,
  },
  useNullAsDefault: true,
  migrations: {
    directory: './src/db/migrations',
    extension: 'ts',
  },
  pool: {
    afterCreate: (conn: any, cb: any) => {
      // Enable foreign key constraints in SQLite
      conn.run('PRAGMA foreign_keys = ON', cb);
    },
  },
};

/**
 * Initialize database connection
 */
const db = knex(knexConfig);

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1');
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Failed to connect to database', error);
    return false;
  }
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
  await db.destroy();
  logger.info('Database connection closed');
}

export default db;
