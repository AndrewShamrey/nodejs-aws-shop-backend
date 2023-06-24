import { Readable } from 'stream';
import { S3_READ_ERROR_MESSAGE, S3_SIGNED_ERROR_MESSAGE } from 'utils/constants';
import logger from 'utils/logger';

const signedUrl = 'signed/url';
const S3ClientInstance = { send: jest.fn() };
const CommandInstance = {};
const S3Client = jest.fn().mockImplementation(() => S3ClientInstance);
const PutObjectCommand = jest.fn().mockImplementation(() => CommandInstance);
const GetObjectCommand = jest.fn().mockImplementation(() => CommandInstance);
const CopyObjectCommand = jest.fn().mockImplementation(() => CommandInstance);
const DeleteObjectCommand = jest.fn().mockImplementation(() => CommandInstance);
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
}));

const getSignedUrl = jest.fn().mockResolvedValue(signedUrl);
jest.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl }));

const publishSQSEvent = jest.fn();
jest.mock('import/sqs', () => ({ publishSQSEvent }));

jest.mock('csv-parser', () => ({ default: jest.fn() }));
jest.mock('strip-bom-stream', () => ({ default: jest.fn() }));

import { getSignedURL, getReadableBody, moveObject } from 'import/s3';

const Bucket = 'example-bucket';
const folder = 'upload-folder';
const folder2 = 'parsed-folder';
const fileName = 'example-file.csv';
const path = `${folder}/${fileName}`;
process.env.IMPORT_BUCKET_NAME = Bucket;
process.env.UPLOAD_FOLDER_NAME = folder;
process.env.PARSED_FOLDER_NAME = folder2;

describe('getSignedURL', () => {
  it('should call getSignedUrl with the correct parameters', async () => {
    const url = await getSignedURL(fileName);

    expect(PutObjectCommand).toBeCalledWith({
      Bucket,
      Key: path,
      ContentType: 'text/csv',
    });

    expect(getSignedUrl).toBeCalledWith(S3ClientInstance, CommandInstance);
    expect(url).toEqual(signedUrl);
  });

  it('should log and rethrow an error if getSignedUrl throws an error', async () => {
    const error = new Error('Some error');
    getSignedUrl.mockRejectedValue(error);

    await expect(getSignedURL(fileName)).rejects.toThrow(error);
    expect(logger.error).toBeCalledWith({ message: error.message }, S3_SIGNED_ERROR_MESSAGE);
  });
});

describe('getReadableBody', () => {
  it('should return the body stream if it is an instance of Readable', async () => {
    const bodyMock = new Readable();
    S3ClientInstance.send.mockResolvedValueOnce({ Body: bodyMock });

    const body = await getReadableBody(path);
    expect(GetObjectCommand).toBeCalledWith({ Bucket, Key: path });
    expect(body).toEqual(bodyMock);
  });

  it('should throw an error if the body is not an instance of Readable', async () => {
    S3ClientInstance.send.mockResolvedValueOnce({ Body: 'invalid-body' });
    await expect(getReadableBody(path)).rejects.toThrowError(S3_READ_ERROR_MESSAGE);
  });
});

describe('moveObject', () => {
  it('should send copy and delete commands to S3 with the correct parameters', async () => {
    await moveObject(path);

    expect(CopyObjectCommand).toBeCalledWith({
      Bucket,
      CopySource: `${Bucket}/${path}`,
      Key: `${folder2}/${fileName}`,
    });

    expect(DeleteObjectCommand).toBeCalledWith({ Bucket, Key: path });
  });
});
