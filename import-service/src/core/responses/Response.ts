import { StatusCodes } from 'http-status-codes';
import { APIGatewayProxyResult } from 'aws-lambda';

export default class Response<T = unknown> {
  constructor(
    public readonly body: T,
    public readonly statusCode: number = StatusCodes.OK,
    public readonly options?: Omit<APIGatewayProxyResult, 'body' | 'statusCode'>,
  ) {}

  serialize(): APIGatewayProxyResult {
    const { statusCode } = this;
    const body = JSON.stringify(this.body);

    return {
      body,
      statusCode,
      ...this.options,
    };
  }

  static from(response: Response | unknown): Response {
    if (response instanceof Response) return response;
    return new Response(response);
  }
}
