import config, { validateConfig } from '../../../src/config';
import * as path from 'path';

describe('Config Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear the module cache to reset the config
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });
  console.log(config);
  describe('Default Configuration', () => {
    it('should have default values when no env vars are set', () => {
      expect(config.env).toBe('development');
      expect(config.port).toBe(3000);
      expect(config.database.client).toBe('sqlite3');
      expect(config.database.path).toContain('data/employees.db');
      expect(config.security.allowedOrigins).toEqual(['http://localhost:3000']);
      expect(config.security.rateLimitWindowMs).toBe(900000);
      expect(config.security.rateLimitMaxRequests).toBe(100);
      expect(config.logging.level).toBe('info');
    });
  });

  describe('Environment Variable Overrides', () => {
    it('should override default values with environment variables', () => {
      process.env.NODE_ENV = 'test';
      process.env.PORT = '4000';
      process.env.DATABASE_CLIENT = 'postgres';
      process.env.DATABASE_PATH = '/custom/path/db.sqlite';
      process.env.ALLOWED_ORIGINS = 'http://test.com,http://api.test.com';
      process.env.RATE_LIMIT_WINDOW_MS = '300000';
      process.env.RATE_LIMIT_MAX_REQUESTS = '500';
      process.env.LOG_LEVEL = 'debug';

      // Reload config to get updated values
      const testConfig = jest.requireActual('../../../src/config').default;
      console.log(testConfig);
      expect(testConfig.env).toBe('test');
      expect(testConfig.port).toBe(4000);
      expect(testConfig.database.client).toBe('postgres');
      expect(testConfig.database.path).toBe('/custom/path/db.sqlite');
      expect(testConfig.security.allowedOrigins).toEqual([
        'http://test.com',
        'http://api.test.com',
      ]);
      expect(testConfig.security.rateLimitWindowMs).toBe(300000);
      expect(testConfig.security.rateLimitMaxRequests).toBe(500);
      expect(testConfig.logging.level).toBe('debug');
    });
  });

  describe('validateConfig', () => {
    it('should not throw error when required environment variables are set', () => {
      process.env.NODE_ENV = 'test';
      process.env.PORT = '3000';

      expect(() => validateConfig()).not.toThrow();
    });

    it('should throw error when required environment variables are missing', () => {
      delete process.env.NODE_ENV;
      delete process.env.PORT;
      expect(() => validateConfig()).toThrow(
        'Missing required environment variables: NODE_ENV, PORT'
      );
    });
  });

  describe('Path Resolution', () => {
    it('should resolve database path relative to project root', () => {
      const expectedPath = path.join(process.cwd(), 'data', 'employees.db');
      expect(config.database.path).toBe(expectedPath);
    });
  });

  //   describe('Type Safety', () => {
  //     it('should have readonly properties', () => {
  //       // @ts-expect-error Testing readonly property
  //       expect(() => {
  //         config.env = 'test';
  //       }).toThrow();
  //       // @ts-expect-error Testing readonly property
  //       expect(() => {
  //         config.port = 4000;
  //       }).toThrow();
  //       // @ts-expect-error Testing readonly property
  //       expect(() => {
  //         config.database.client = 'postgres';
  //       }).toThrow();
  //     });
  //   });
});
