import { FullProduct } from 'interfaces/fullProduct';

const SNSClientInstance = { send: jest.fn() };
const CommandInstance = {};
const SNSClient = jest.fn().mockImplementation(() => SNSClientInstance);
const PublishCommand = jest.fn().mockImplementation(() => CommandInstance);
jest.mock('@aws-sdk/client-sns', () => ({ SNSClient, PublishCommand }));

import { notifyAboutProductCreate } from 'product/sns';

const TopicArn = 'topic-arn';
process.env.CREATE_PRODUCT_TOPIC_ARN = TopicArn;

describe('notifyAboutProductCreate', () => {
  const messagePayload = ({ test: true, count: 1 } as unknown) as FullProduct;

  it('should publish message to SNS', async () => {
    await notifyAboutProductCreate(messagePayload);

    expect(PublishCommand).toBeCalledWith({
      Subject: 'New files added to Catalog',
      Message: JSON.stringify(messagePayload),
      TopicArn,
      MessageAttributes: expect.objectContaining({
        count: {
          DataType: 'Number',
          StringValue: String(messagePayload.count),
        },
      }),
    });
  });

  it('should throw an error when sending message to SNS fails', async () => {
    SNSClientInstance.send.mockRejectedValue(new Error());
    await expect(notifyAboutProductCreate(messagePayload)).rejects.toThrow();
  });
});
