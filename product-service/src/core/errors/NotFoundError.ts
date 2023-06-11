import StatusCodes from 'http-status-codes';
import BackendError from 'core/errors/BackendError';

export default class NotFoundError extends BackendError {
  constructor(
    message: string,
    details?: unknown,
    errors: Error[] = [],
    statusCode = StatusCodes.NOT_FOUND,
  ) {
    super(message, details, errors, statusCode);
  }
}
