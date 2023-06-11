import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import StatusCodes from 'http-status-codes';
import { product } from '__testUtils__/samples/product';

const getProductsById = jest.fn().mockResolvedValue(product);
jest.mock('product/index', () => ({ getProductsById }));

import { handler } from 'handlers/getProductsById';

describe('getProductsById', () => {
  const context = {} as Context;
  const callback = () => {
    throw new Error('Should never been called');
  };

  it('should response with product', async () => {
    const event = ({
      pathParameters: { productId: product.productId },
    } as unknown) as APIGatewayProxyEvent;

    const response = (await handler(event, context, callback)) as APIGatewayProxyResult;

    expect(getProductsById).toBeCalledWith(product.productId);
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.body).toEqual(JSON.stringify(product));
  });

  it('should return 404 when no product presented', async () => {
    getProductsById.mockReturnValueOnce(undefined);
    const fakeId = 'unrealProductId';
    const event = ({
      pathParameters: { productId: fakeId },
    } as unknown) as APIGatewayProxyEvent;

    const response = (await handler(event, context, callback)) as APIGatewayProxyResult;

    expect(getProductsById).toBeCalledWith(fakeId);
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
