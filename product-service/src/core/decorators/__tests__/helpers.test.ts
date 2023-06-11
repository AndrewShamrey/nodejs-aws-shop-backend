import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import BackendError from 'core/errors/BackendError';
import { HEADERS } from 'utils/constants';
import { enableCORS, handleError } from 'core/decorators/helpers';

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
