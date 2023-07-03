import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent, Context } from 'aws-lambda';

const authResult = ({ test: true } as unknown) as APIGatewayAuthorizerResult;
const basicAuthorizer = jest.fn().mockReturnValue(authResult);
jest.mock('authorization/index', () => ({ basicAuthorizer }));

import { handler } from 'handlers/basicAuthorizer';

describe('basicAuthorizer', () => {
  const authorizationToken = 'Test token';
  const event = ({ authorizationToken } as unknown) as APIGatewayTokenAuthorizerEvent;
  const context = {} as Context;

  it('should response with signed url', async () => {
    const response = await handler(event, context);

    expect(basicAuthorizer).toBeCalledWith(authorizationToken);
    expect(response).toEqual(authResult);
  });
});
