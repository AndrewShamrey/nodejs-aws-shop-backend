import { ProductsDetails } from 'interfaces/index';

const SQSClientInstance = { send: jest.fn() };
const CommandInstance = {};
const SQSClient = jest.fn().mockImplementation(() => SQSClientInstance);
const SendMessageCommand = jest.fn().mockImplementation(() => CommandInstance);
jest.mock('@aws-sdk/client-sqs', () => ({ SQSClient, SendMessageCommand }));

import { publishSQSEvent } from 'import/sqs';

const QueueUrl = 'queue-url';
process.env.IMPORT_QUEUE_URL = QueueUrl;

describe('publishSQSEvent', () => {
  const messagePayload = ({ test: true } as unknown) as ProductsDetails;

  it('should publish message to SQS', async () => {
    await publishSQSEvent(messagePayload);

    expect(SendMessageCommand).toBeCalledWith({
      MessageBody: JSON.stringify(messagePayload),
      QueueUrl,
      MessageAttributes: expect.any(Object),
    });
  });

  it('should throw an error when sending message to SQS fails', async () => {
    SQSClientInstance.send.mockRejectedValue(new Error());
    await expect(publishSQSEvent(messagePayload)).rejects.toThrow();
  });
});
