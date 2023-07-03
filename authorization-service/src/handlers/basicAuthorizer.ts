import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent, Context } from 'aws-lambda';
import { basicAuthorizer } from 'authorization/index';
import logger from 'utils/logger';

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
  context: Context,
): Promise<APIGatewayAuthorizerResult> => {
  const { awsRequestId, functionName } = context;

  logger.info({ awsRequestId, functionName, event }, 'Basic Authorizer request');

  return basicAuthorizer(event.authorizationToken);
};
