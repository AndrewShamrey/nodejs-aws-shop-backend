import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { apiGwProxy } from 'core/decorators';
import CreatedResponse from 'core/responses/CreatedResponse';
import { createProduct } from 'product/index';
import logger from 'utils/logger';

export const handler = apiGwProxy(async (event: APIGatewayProxyEvent, context: Context) => {
  const { awsRequestId, functionName } = context;

  logger.info({ awsRequestId, functionName, event }, 'Product create request');

  const productPayload = JSON.parse(event.body);
  const product = await createProduct(context, productPayload);

  logger.info({ productId: product.id }, 'Product created in database');

  return new CreatedResponse(product);
});
