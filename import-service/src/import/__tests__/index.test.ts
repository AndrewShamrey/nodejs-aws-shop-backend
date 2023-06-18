import { APIGatewayProxyEvent, S3Event } from 'aws-lambda';
import BadRequestError from 'core/errors/BadRequestError';

const signedUrl = 'signed/url';
const getSignedURL = jest.fn().mockResolvedValue(signedUrl);
const getObjectFromS3WithReadableStream = jest.fn();
jest.mock('import/s3', () => ({ getSignedURL, getObjectFromS3WithReadableStream }));

import { importProductsFile, importFileParser } from 'import/index';

describe('importProductsFile', () => {
  it('should throw BadRequestError if file name is not provided', async () => {
    const event = ({ queryStringParameters: {} } as unknown) as APIGatewayProxyEvent;
    await expect(importProductsFile(event)).rejects.toThrow(BadRequestError);
  });

  it('should call getSignedURL with the provided file name', async () => {
    const fileName = 'example-file.csv';
    const event = ({
      queryStringParameters: { name: fileName },
    } as unknown) as APIGatewayProxyEvent;

    const result = await importProductsFile(event);

    expect(getSignedURL).toBeCalledWith(fileName);
    expect(result).toEqual(signedUrl);
  });
});

describe('importFileParser', () => {
  it('should throw BadRequestError if no records found in the event', async () => {
    const event: S3Event = { Records: [] };
    await expect(importFileParser(event)).rejects.toThrow(BadRequestError);
  });

  it('should call getObjectFromS3WithReadableStream with the file name', async () => {
    const fileName = 'example-file.csv';
    const event = ({
      Records: [{ s3: { object: { key: fileName } } }],
    } as unknown) as S3Event;

    await importFileParser(event);

    expect(getObjectFromS3WithReadableStream).toBeCalledWith(fileName);
  });
});
