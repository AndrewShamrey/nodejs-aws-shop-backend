import { S3Event, Context } from 'aws-lambda';
import { s3 } from 'core/decorators';
import { importFileParser } from 'import/index';
import logger from 'utils/logger';

export const handler = s3(async (event: S3Event, context: Context) => {
  const { awsRequestId, functionName } = context;

  logger.info({ awsRequestId, functionName, event }, 'Import File Parser request');

  await importFileParser(event);
});
