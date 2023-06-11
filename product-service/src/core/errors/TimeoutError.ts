import StatusCodes from 'http-status-codes';
import BackendError from 'core/errors/BackendError';

export default class TimeoutError extends BackendError {
  constructor(
    message: string,
    details?: unknown,
    errors: Error[] = [],
    statusCode = StatusCodes.REQUEST_TIMEOUT,
  ) {
    super(message, details, errors, statusCode);
  }
}
