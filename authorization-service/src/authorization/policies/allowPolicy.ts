import { APIGatewayAuthorizerResult } from 'aws-lambda';

export const allowPolicy = (
  principalId = 'apigateway.amazonaws.com',
  context?: Record<string, string>,
): APIGatewayAuthorizerResult => ({
  principalId,
  context,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: '*',
      },
    ],
  },
});
