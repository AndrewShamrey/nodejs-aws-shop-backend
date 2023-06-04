import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import NotFoundError from 'core/errors/NotFoundError';
import { apiGwProxy } from 'core/decorators';
import { getProductsById } from 'product/index';
import logger from 'utils/logger';

export const handler = apiGwProxy(async (event: APIGatewayProxyEvent, context: Context) => {
  const {
    pathParameters: { productId },
  } = event;
  const { awsRequestId, functionName } = context;

  logger.info({ awsRequestId, functionName, productId }, 'Get Products by Id request');

  const product = await getProductsById(productId);

  if (!product) {
    throw new NotFoundError('Product not found', { productId });
  }

  logger.info({ productId }, 'Product found');

  return product;
});
