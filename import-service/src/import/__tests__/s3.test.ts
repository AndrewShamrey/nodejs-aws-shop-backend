import { Readable } from 'stream';
import { S3_READ_ERROR_MESSAGE, S3_SIGNED_ERROR_MESSAGE } from 'utils/constants';
import logger from 'utils/logger';

const signedUrl = 'signed/url';
const S3ClientInstance = { send: jest.fn() };
const CommandInstance = {};
const S3Client = jest.fn().mockImplementation(() => S3ClientInstance);
const PutObjectCommand = jest.fn().mockImplementation(() => CommandInstance);
const GetObjectCommand = jest.fn().mockImplementation(() => CommandInstance);
jest.mock('@aws-sdk/client-s3', () => ({ S3Client, PutObjectCommand, GetObjectCommand }));

const getSignedUrl = jest.fn().mockResolvedValue(signedUrl);
jest.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl }));

import { getSignedURL, getReadableBody } from 'import/s3';

const Bucket = 'example-bucket';
const folder = 'upload-folder';
const fileName = 'example-file.csv';
const path = `${folder}/${fileName}`;
process.env.IMPORT_BUCKET_NAME = Bucket;
process.env.UPLOAD_FOLDER_NAME = folder;

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
