import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import StatusCodes from 'http-status-codes';

const signedUrl = 'signed/url';
const importProductsFile = jest.fn().mockResolvedValue(signedUrl);
jest.mock('import/index', () => ({ importProductsFile }));

import { handler } from 'handlers/importProductsFile';

describe('importProductsFile', () => {
  const event = ({} as unknown) as APIGatewayProxyEvent;
  const context = {} as Context;
  const callback = () => {
    throw new Error('Should never been called');
  };

  it('should response with signed url', async () => {
    const response = (await handler(event, context, callback)) as APIGatewayProxyResult;

    expect(importProductsFile).toBeCalledWith(event);
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.body).toEqual(JSON.stringify(signedUrl));
  });
});
