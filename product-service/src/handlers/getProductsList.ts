import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { apiGwProxy } from 'core/decorators';
import { getProductsList } from 'product/index';
import logger from 'utils/logger';

export const handler = apiGwProxy(async (event: APIGatewayProxyEvent, context: Context) => {
  const { multiValueQueryStringParameters } = event;
  const { awsRequestId, functionName } = context;

  logger.info({ awsRequestId, functionName }, 'List Products request');
  logger.info(multiValueQueryStringParameters, 'Request Parameters');

  const products = await getProductsList();

  logger.info(
    {
      count: products.length,
      items: products.map(({ productId }) => productId),
    },
    'Products are found',
  );

  return products;
});
