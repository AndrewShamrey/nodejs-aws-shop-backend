import StatusCodes from 'http-status-codes';
import BackendError from 'core/errors/BackendError';

describe('BackendError', () => {
  const mockMessage = 'Something went wrong';
  const mockDetails = { id: '123', operation: 'get' };
  const mockErrors = [new Error('Error 1'), new Error('Error 2')];
  const mockStatusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  describe('constructor', () => {
    it('should create BackendError object with default values', () => {
      const backendError = new BackendError(mockMessage);

      expect(backendError.message).toBe(mockMessage);
      expect(backendError.details).toBeUndefined();
      expect(backendError.errors).toEqual([]);
      expect(backendError.statusCode).toBe(mockStatusCode);
    });

    it('should create BackendError object with provided values', () => {
      const backendError = new BackendError(
        mockMessage,
        mockDetails,
        mockErrors,
        StatusCodes.SERVICE_UNAVAILABLE,
      );

      expect(backendError.message).toBe(mockMessage);
      expect(backendError.details).toBe(mockDetails);
      expect(backendError.errors).toEqual(mockErrors);
      expect(backendError.statusCode).toBe(StatusCodes.SERVICE_UNAVAILABLE);
    });
  });

  describe('serialize', () => {
    it('should serialize BackendError object', () => {
      const backendError = new BackendError(mockMessage, mockDetails, mockErrors);
      const serializedError = backendError.serialize();

      expect(serializedError.statusCode).toEqual(mockStatusCode);
      expect(serializedError.message).toEqual(mockMessage);
      expect(serializedError.code).toEqual('BackendError');
      expect(serializedError.errors).toEqual([
        { message: 'Error 1', code: 'Error' },
        { message: 'Error 2', code: 'Error' },
      ]);
      expect(serializedError.details).toBe(mockDetails);
    });
  });

  describe('from', () => {
    it('should return the same BackendError object if already an instance of BackendError', () => {
      const existingBackendError = new BackendError(mockMessage, mockDetails, mockErrors);
      const result = BackendError.from(existingBackendError);

      expect(result).toEqual(existingBackendError);
    });

    it('should create new BackendError object if the input is not an instance of BackendError', () => {
      const error = new Error(mockMessage);
      const result = BackendError.from(error);

      expect(result).toBeInstanceOf(BackendError);
      expect(result.message).toEqual(mockMessage);
      expect(result.details).toBeNull();
      expect(result.errors).toEqual([error]);
      expect(result.statusCode).toEqual(mockStatusCode);
    });
  });
});
