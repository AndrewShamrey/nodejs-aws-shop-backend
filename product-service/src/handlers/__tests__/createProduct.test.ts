import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import StatusCodes from 'http-status-codes';
import { fullProduct } from '__testUtils__/samples/fullProduct';
import { requestBodyProductCreate } from '__testUtils__/samples/request';

const createProduct = jest.fn().mockResolvedValue(fullProduct);
jest.mock('product/index', () => ({ createProduct }));

import { handler } from 'handlers/createProduct';

describe('createProduct', () => {
  const body = JSON.stringify(requestBodyProductCreate);
  const event = ({ body } as unknown) as APIGatewayProxyEvent;
  const context = {} as Context;
  const callback = () => {
    throw new Error('Should never been called');
  };

  it('should response with new product', async () => {
    const response = (await handler(event, context, callback)) as APIGatewayProxyResult;

    expect(createProduct).toBeCalledWith(context, requestBodyProductCreate);
    expect(response.statusCode).toEqual(StatusCodes.CREATED);
    expect(response.body).toEqual(JSON.stringify(fullProduct));
  });
});
