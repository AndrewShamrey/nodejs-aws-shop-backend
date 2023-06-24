import { APIGatewayProxyEvent, S3Event } from 'aws-lambda';
import { getSignedURL, getObjectFromS3WithReadableStream } from 'import/s3';
import BadRequestError from 'core/errors/BadRequestError';

const importProductsFile = async (event: APIGatewayProxyEvent): Promise<string> => {
  const name = event.queryStringParameters?.name;

  if (!name) throw new BadRequestError('File name does not provided');

  return await getSignedURL(name);
};

const importFileParser = async (event: S3Event): Promise<void> => {
  if (!event.Records.length) throw new BadRequestError('No records found');

  const fileName = event.Records[0].s3.object.key;
  await getObjectFromS3WithReadableStream(fileName);
};

export { importProductsFile, importFileParser };
