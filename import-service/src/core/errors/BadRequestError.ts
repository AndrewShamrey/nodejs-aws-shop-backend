import StatusCodes from 'http-status-codes';
import BackendError from 'core/errors/BackendError';

export default class BadRequestError extends BackendError {
  constructor(
    message: string,
    details?: unknown,
    errors: Error[] = [],
    statusCode = StatusCodes.BAD_REQUEST,
  ) {
    super(message, details, errors, statusCode);
  }
}
