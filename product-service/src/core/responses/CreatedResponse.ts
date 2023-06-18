import StatusCodes from 'http-status-codes';
import { APIGatewayProxyResult } from 'aws-lambda';
import Response from 'core/responses/Response';

export default class CreatedResponse extends Response {
  constructor(body: unknown, options?: Omit<APIGatewayProxyResult, 'body' | 'statusCode'>) {
    super(body, StatusCodes.CREATED, options);
  }
}
