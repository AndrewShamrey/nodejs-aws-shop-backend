import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import BackendError from 'core/errors/BackendError';
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

export { enableCORS, handleError };
