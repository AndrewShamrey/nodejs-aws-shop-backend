import StatusCodes from 'http-status-codes';
import BackendError from 'core/errors/BackendError';

export default class UnsupportedMediaTypeError extends BackendError {
  constructor(
    contentType: string,
    details?: unknown,
    errors: Error[] = [],
    statusCode = StatusCodes.UNSUPPORTED_MEDIA_TYPE,
  ) {
    super(`${contentType} - Unsupported Media Type`, details, errors, statusCode);
  }
}
