import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PassThrough, Readable } from 'stream';
import csv from 'csv-parser';
import stripBom from 'strip-bom-stream';
import { ProductsDetails } from 'interfaces/index';
import { publishSQSEvent } from 'import/sqs';
import { S3_SIGNED_ERROR_MESSAGE, S3_READ_ERROR_MESSAGE } from 'utils/constants';
import logger from 'utils/logger';

const s3Client = new S3Client({ region: process.env.IMPORT_AWS_REGION });

const getSignedURL = async (fileName: string): Promise<string> => {
  const { IMPORT_BUCKET_NAME: Bucket, UPLOAD_FOLDER_NAME } = process.env;
  const Key = `${UPLOAD_FOLDER_NAME}/${fileName}`;

  try {
    const putCommand = new PutObjectCommand({
      Bucket,
      Key,
      ContentType: 'text/csv',
    });

    const url = await getSignedUrl(s3Client, putCommand);

    return url;
  } catch (error) {
    logger.error({ message: error.message }, S3_SIGNED_ERROR_MESSAGE);
    throw error;
  }
};

const getReadableBody = async (path: string): Promise<Readable> => {
  const { IMPORT_BUCKET_NAME: Bucket } = process.env;
  const getCommand = new GetObjectCommand({ Bucket, Key: path });

  const file = await s3Client.send(getCommand);
  const body = file?.Body;

  if (!(body instanceof Readable)) throw new Error(S3_READ_ERROR_MESSAGE);

  return body;
};

const moveObject = async (path: string): Promise<void> => {
  const { IMPORT_BUCKET_NAME: Bucket, UPLOAD_FOLDER_NAME, PARSED_FOLDER_NAME } = process.env;

  const copyCommand = new CopyObjectCommand({
    Bucket,
    CopySource: `${Bucket}/${path}`,
    Key: path.replace(UPLOAD_FOLDER_NAME, PARSED_FOLDER_NAME),
  });
  await s3Client.send(copyCommand);

  logger.info({}, 'File copy completed');

  const deleteCommand = new DeleteObjectCommand({ Bucket, Key: path });
  await s3Client.send(deleteCommand);

  logger.info({}, 'File deletion completed');
};

const getObjectFromS3WithReadableStream = async (path: string): Promise<void> => {
  const body = await getReadableBody(path);

  const COLUMN_SEPARATOR = ';';
  const NUMERIC_FIELDS = ['price', 'count'];
  const mapValues = ({ header, value }) => (NUMERIC_FIELDS.includes(header) ? +value : value);

  await new Promise((resolve, reject) => {
    body
      .pipe(new PassThrough())
      .pipe(stripBom())
      .pipe(csv({ separator: COLUMN_SEPARATOR, mapValues }))
      .on('data', async (productDetails: ProductsDetails) => await publishSQSEvent(productDetails))
      .on('error', (error) => {
        logger.error({ error }, S3_READ_ERROR_MESSAGE);
        reject(error);
      })
      .on('end', async () => {
        logger.info({}, 'File reading completed');
        await moveObject(path);

        resolve(null);
      });
  });
};

export { getSignedURL, getObjectFromS3WithReadableStream, getReadableBody, moveObject };
