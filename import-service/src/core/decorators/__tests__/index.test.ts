import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import StatusCodes from 'http-status-codes';
import { apiGwProxy } from 'core/decorators';

const enableCORS = jest.spyOn(require('core/decorators/helpers'), 'enableCORS');
const handleError = jest.spyOn(require('core/decorators/helpers'), 'handleError');

const context = {} as Context;
const data = Object.freeze({ data: 'data' });
const callback = () => {
  throw new Error('Should never been called');
};

describe('apiGwProxy', () => {
  it('should call commonLogic and return the serialized response with CORS enabled', async () => {
    const event = {
      body: JSON.stringify(data),
    } as APIGatewayProxyEvent;

    const callbackFn = jest.fn(async () => data);
    const handler: APIGatewayProxyHandler = apiGwProxy(callbackFn);
    const response = (await handler(event, context, callback)) as APIGatewayProxyResult;

    expect(callbackFn).toBeCalledWith(event, context);
    expect(enableCORS).toBeCalled();
    expect(response.body).toBe(JSON.stringify(data));
  });

  it('should call the logger and return the serialized error when an error occurs', async () => {
    const event = {} as APIGatewayProxyEvent;
    const error = new Error();

    const errorHandler = apiGwProxy<typeof data>(async () => {
      throw error;
    });
    const response = (await errorHandler(event, context, callback)) as APIGatewayProxyResult;

    expect(handleError).toBeCalledWith(error);
    expect(response).toEqual({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: expect.any(String),
    });
  });
});
