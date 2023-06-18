import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { apiGwProxy } from 'core/decorators';
import { importProductsFile } from 'import/index';
import logger from 'utils/logger';

export const handler = apiGwProxy(async (event: APIGatewayProxyEvent, context: Context) => {
  const { awsRequestId, functionName } = context;

  logger.info({ awsRequestId, functionName, event }, 'Import Products File request');

  const signedUrl = await importProductsFile(event);

  logger.info({ signedUrl }, 'Signed url was created');

  return signedUrl;
});
