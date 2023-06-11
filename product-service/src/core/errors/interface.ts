type ShortErrorResponse = {
  /** @example BadRequestError */
  code: string;
  /** @example Invalid request */
  message: string;
};

type ErrorResponse = {
  /** @example 400 */
  statusCode: number;
  /** @example Invalid request */
  message: string;
  /** @example BadRequestError */
  code: string;
  errors: ShortErrorResponse[];
  /** @example { "validation": "id field is missing" } */
  details?: unknown;
};

export { ShortErrorResponse, ErrorResponse };
