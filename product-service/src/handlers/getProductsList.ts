import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { apiGwProxy } from 'core/decorators';
import { getProductsList } from 'product/index';
import logger from 'utils/logger';

export const handler = apiGwProxy(async (event: APIGatewayProxyEvent, context: Context) => {
  const { awsRequestId, functionName } = context;

  logger.info({ awsRequestId, functionName, event }, 'List Products request');

  const products = await getProductsList();

  logger.info(
    {
      count: products.length,
      items: products.map(({ id }) => id),
    },
    'Products are found',
  );

  return products;
});
