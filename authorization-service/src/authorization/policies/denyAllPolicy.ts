import { APIGatewayAuthorizerResult } from 'aws-lambda';

export const denyAllPolicy = (): APIGatewayAuthorizerResult => ({
  principalId: '*',
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: '*',
        Effect: 'Deny',
        Resource: '*',
      },
    ],
  },
});
