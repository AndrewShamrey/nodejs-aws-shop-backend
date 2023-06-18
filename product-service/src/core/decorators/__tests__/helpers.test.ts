import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import UnsupportedMediaTypeError from 'core/errors/UnsupportedMediaTypeError';
import BackendError from 'core/errors/BackendError';
import { HEADERS } from 'utils/constants';
import { enableCORS, handleError, validateContentType } from 'core/decorators/helpers';

describe('enableCORS', () => {
  it('should add CORS header to the response', () => {
    const response: APIGatewayProxyResult = {
      statusCode: 200,
      body: 'Success',
      headers: {
        [HEADERS.HEADER_CONTENT_TYPE]: 'application/json',
      },
    };

    const modifiedResponse = enableCORS(response);

    expect(modifiedResponse.headers).toEqual({
      [HEADERS.HEADER_CONTENT_TYPE]: 'application/json',
      [HEADERS.HEADER_CORS]: '*',
    });
  });
});

describe('handleError', () => {
  it('should convert an error to a serialized BackendError in the response', () => {
    const message = 'Something went wrong';
    const error = new Error(message);
    const backendError = new BackendError(message, null, [error]);

    const serializedError = JSON.stringify(backendError.serialize());

    const response = handleError(error);

    expect(response.statusCode).toEqual(backendError.statusCode);
    expect(response.body).toEqual(serializedError);
  });
});

describe('validateContentType', () => {
  it('should not throw an error if the content type is "application/json"', () => {
    expect(() =>
      validateContentType(({
        httpMethod: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      } as unknown) as APIGatewayProxyEvent),
    ).not.toThrow();
  });

  it('should throw an error if the content type is missing', () => {
    expect(() =>
      validateContentType(({
        httpMethod: 'POST',
        headers: {},
      } as unknown) as APIGatewayProxyEvent),
    ).toThrow(UnsupportedMediaTypeError);
  });

  it('should throw an error if the content type is not "application/json"', () => {
    expect(() =>
      validateContentType(({
        httpMethod: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
      } as unknown) as APIGatewayProxyEvent),
    ).toThrow(UnsupportedMediaTypeError);
  });

  it('should not throw an error for non-POST or non-PUT methods', () => {
    expect(() =>
      validateContentType(({
        httpMethod: 'GET',
        headers: {
          'Content-Type': 'text/plain',
        },
      } as unknown) as APIGatewayProxyEvent),
    ).not.toThrow();
  });
});
