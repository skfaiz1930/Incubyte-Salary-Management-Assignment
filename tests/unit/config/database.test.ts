import {
  initDb,
  getDb,
  setDb,
  closeConnection,
  testConnection,
} from '../../../src/config/database';
import { Knex } from 'knex';
import logger from '../../../src/utils/logger';

// Mock the logger
jest.mock('../../../src/utils/logger');

describe('Database Configuration', () => {
  let mockDb: jest.Mocked<Knex>;

  beforeEach(() => {
    // Create a mock Knex instance
    mockDb = {
      raw: jest.fn(),
      destroy: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Knex>;

    // Clear all mocks and instances
    jest.clearAllMocks();
    // @ts-ignore - Reset the module cache to clear the singleton instance
    jest.resetModules();
    // @ts-ignore - Clear the instance between tests
    require('../../../src/config/database').dbInstance = null;
  });

  afterEach(async () => {
    // Ensure we clean up after each test
    await closeConnection();
  });

  describe('initDb', () => {
    it('should initialize database with default config', () => {
      const db = initDb();
      expect(db).toBeDefined();
    });

    it('should initialize database with custom config', () => {
      const customConfig = {
        client: 'sqlite3',
        connection: { filename: ':memory:' },
        useNullAsDefault: true,
      };
      const db = initDb(customConfig);
      expect(db).toBeDefined();
    });

    it('should return existing instance if already initialized', () => {
      const db1 = initDb();
      const db2 = initDb();
      expect(db1).toBe(db2);
    });
  });

  describe('getDb', () => {
    it('should return database instance when initialized', () => {
      const db = initDb();
      expect(getDb()).toBe(db);
    });

    it('should throw error when database not initialized', () => {
      expect(() => getDb()).toThrow('Database not initialized');
    });
  });

  describe('setDb', () => {
    it('should set the database instance', () => {
      setDb(mockDb as any);
      expect(getDb()).toBe(mockDb);
    });
  });

  describe('testConnection', () => {
    it('should return true when connection is successful', async () => {
      mockDb.raw.mockResolvedValueOnce([{ '1': 1 }]);
      setDb(mockDb as any);

      const result = await testConnection();

      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('Database connection established successfully');
    });

    it('should return false when connection fails', async () => {
      mockDb.raw.mockRejectedValueOnce(new Error('Connection failed'));
      setDb(mockDb as any);

      const result = await testConnection();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('closeConnection', () => {
    it('should close the database connection', async () => {
      mockDb.destroy.mockResolvedValue(undefined);
      setDb(mockDb as any);

      await closeConnection();

      expect(mockDb.destroy).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Database connection closed');
    });

    it('should handle case when database is not initialized', async () => {
      await expect(closeConnection()).resolves.not.toThrow();
    });
  });

  describe('default export', () => {
    it('should provide access to the database instance', () => {
      const db = initDb();
      const { instance } = require('../../../src/config/database').default;
      expect(instance).toBe(db);
    });
  });
});
