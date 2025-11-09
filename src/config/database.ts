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
 * Global database instance
 */
let dbInstance: Knex | null = null;

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
export function initDb(customConfig?: Knex.Config): Knex {
  if (dbInstance) {
    return dbInstance;
  }

  const configToUse = customConfig || knexConfig;
  dbInstance = knex(configToUse);

  return dbInstance;
}

/**
 * Get current database instance
 */
export function getDb(): Knex {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return dbInstance;
}

/**
 * Set database instance (mainly for testing)
 */
export function setDb(db: Knex): void {
  dbInstance = db;
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const db = getDb();
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
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
    logger.info('Database connection closed');
  }
}

// Auto-initialize for non-test environments
if (process.env.NODE_ENV !== 'test') {
  initDb();
}

// Default export for backward compatibility
export default {
  get instance() {
    return getDb();
  },
};
