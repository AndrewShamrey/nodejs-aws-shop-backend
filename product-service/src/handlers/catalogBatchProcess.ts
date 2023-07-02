import { SQSEvent, Context } from 'aws-lambda';
import { sqs } from 'core/decorators';
import { catalogBatchProcess } from 'product/index';
import logger from 'utils/logger';

export const handler = sqs(async (event: SQSEvent, context: Context) => {
  const { awsRequestId, functionName } = context;

  logger.info({ awsRequestId, functionName, event }, 'Catalog Batch Process request');

  await catalogBatchProcess(context, event);
});
