import { errorHandler, notFoundHandler } from '../../../src/middleware/error.middleware';
import { Request, Response, NextFunction } from 'express';
import logger from '../../../src/utils/logger';
import { AppError } from '../../../src/utils/errors';

// Mock the logger
jest.mock('../../../src/utils/logger');

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request mock
    mockRequest = {
      method: 'GET',
      url: '/test',
      originalUrl: '/test',
      body: { test: 'body' },
      params: { id: '123' },
      query: { page: '1' },
    };

    // Setup response mock
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();

    mockResponse = {
      status: statusMock.mockReturnValue({ json: jsonMock }),
      json: jsonMock,
    };

    mockNext = jest.fn();
  });

  describe('errorHandler', () => {
    it('should handle AppError with status code', () => {
      const error = new AppError(400, 'Test error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(logger.error).toHaveBeenCalledWith({
        err: error,
        req: {
          method: 'GET',
          url: '/test',
          body: { test: 'body' },
          params: { id: '123' },
          query: { page: '1' },
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Test error',
      });
    });

    it('should handle generic Error with 500 status in production', () => {
      // Set NODE_ENV to production
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Generic error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });

      // Restore NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });

    it('should include error details in development', () => {
      // Ensure NODE_ENV is development
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Development error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Development error',
      });

      // Restore NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 status with route not found message', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response);
      console.log(mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Route GET /test not found',
      });
    });

    it('should handle empty URL in 404 response', () => {
      mockRequest.url = '';
      mockRequest.originalUrl = '';
      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Route GET  not found',
      });
    });
  });

  it('should handle Error objects without a status code', () => {
    const error = new Error('Test error');
    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalled();
  });

  it('should handle non-Error objects', () => {
    const error = { message: 'Non-Error object' };
    errorHandler(error as any, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalled();
  });
});
