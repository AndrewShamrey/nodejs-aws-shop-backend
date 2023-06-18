import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import UnsupportedMediaTypeError from 'core/errors/UnsupportedMediaTypeError';
import BackendError from 'core/errors/BackendError';
import { getValueFromHeaders } from 'utils/headers';
import { HEADERS } from 'utils/constants';

const enableCORS = (response: APIGatewayProxyResult): APIGatewayProxyResult => {
  response.headers = {
    ...response.headers,
    [HEADERS.HEADER_CORS]: '*',
  };
  return response;
};

const handleError = (error: Error): APIGatewayProxyResult => {
  const backendError = BackendError.from(error);
  return {
    statusCode: backendError.statusCode,
    body: JSON.stringify(backendError.serialize()),
  };
};

const validateContentType = (event: APIGatewayProxyEvent): void => {
  if (['POST', 'PUT'].includes(event.httpMethod)) {
    const contentType = getValueFromHeaders(event.headers)(HEADERS.HEADER_CONTENT_TYPE);

    if (contentType && !contentType.includes('application/json')) {
      throw new UnsupportedMediaTypeError(contentType);
    }
  }
};

export { enableCORS, handleError, validateContentType };
