import {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
  InternalServerError,
} from '../../../src/utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError instance with default operational status', () => {
      const error = new AppError(400, 'Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test error');
      expect(error.isOperational).toBe(true);
      expect(error.stack).toBeDefined();
    });

    it('should create an AppError with non-operational status', () => {
      const error = new AppError(500, 'Server error', false);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with correct status and message', () => {
      const error = new NotFoundError('Employee', '123');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Employee with id 123 not found');
      expect(error.isOperational).toBe(true);
    });

    it('should handle numeric IDs', () => {
      const error = new NotFoundError('User', 456);
      expect(error.message).toBe('User with id 456 not found');
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with correct status and message', () => {
      const error = new ValidationError('Invalid email format');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid email format');
      expect(error.isOperational).toBe(true);
    });
  });

  describe('ConflictError', () => {
    it('should create a ConflictError with correct status and message', () => {
      const error = new ConflictError('Email already exists');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Email already exists');
      expect(error.isOperational).toBe(true);
    });
  });

  describe('InternalServerError', () => {
    it('should create an InternalServerError with default message', () => {
      const error = new InternalServerError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(InternalServerError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
      expect(error.isOperational).toBe(false);
    });

    it('should create an InternalServerError with custom message', () => {
      const error = new InternalServerError('Custom server error');
      expect(error.message).toBe('Custom server error');
    });
  });
});
