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

const getObjectFromS3WithReadableStream = async (path: string): Promise<void> => {
  const { IMPORT_BUCKET_NAME: Bucket, UPLOAD_FOLDER_NAME, PARSED_FOLDER_NAME } = process.env;
  const body = await getReadableBody(path);

  await new Promise((resolve, reject) => {
    body
      .pipe(new PassThrough())
      .pipe(csv())
      .on('data', () => logger.info)
      .on('error', (error) => {
        logger.error({ error }, S3_READ_ERROR_MESSAGE);
        reject(error);
      })
      .on('end', async () => {
        logger.info({}, 'File reading completed');

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

        resolve(null);
      });
  });
};

export { getSignedURL, getObjectFromS3WithReadableStream, getReadableBody };
