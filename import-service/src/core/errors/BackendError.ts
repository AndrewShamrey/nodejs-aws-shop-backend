import StatusCodes from 'http-status-codes';
import { ErrorResponse, ShortErrorResponse } from 'core/errors/interface';

export default class BackendError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown,
    public readonly errors: Error[] = [],
    public readonly statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(message);
  }

  serialize(): ErrorResponse {
    const { statusCode, details } = this;
    const { message, code } = BackendError.serializeError(this);
    const errors = this.errors.map(BackendError.serializeError);

    return {
      statusCode,
      code,
      message,
      errors,
      details,
    };
  }

  protected static serializeError(error: Error): ShortErrorResponse {
    const { message } = error;
    const code = error.constructor.name;

    return { message, code };
  }

  static from(error: Error): BackendError {
    if (error instanceof BackendError) return error;

    const { message } = error,
      errors = [error],
      code = StatusCodes.INTERNAL_SERVER_ERROR;
    return new BackendError(message, null, errors, code);
  }
}
