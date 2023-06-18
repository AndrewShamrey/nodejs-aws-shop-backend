import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import StatusCodes from 'http-status-codes';
import { fullProductsList } from '__testUtils__/samples/fullProduct';

const getProductsList = jest.fn().mockResolvedValue(fullProductsList);
jest.mock('product/index', () => ({ getProductsList }));

import { handler } from 'handlers/getProductsList';

describe('getProductsList', () => {
  const event = ({} as unknown) as APIGatewayProxyEvent;
  const context = {} as Context;
  const callback = () => {
    throw new Error('Should never been called');
  };

  it('should response with products list', async () => {
    const response = (await handler(event, context, callback)) as APIGatewayProxyResult;

    expect(getProductsList).toBeCalled();
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.body).toEqual(JSON.stringify(fullProductsList));
  });
});
