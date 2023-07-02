import { SNSClient, PublishCommand, MessageAttributeValue } from '@aws-sdk/client-sns';
import { FullProduct } from 'interfaces/fullProduct';
import { SNS_ERROR } from 'utils/constants';
import logger from 'utils/logger';

const snsClient = new SNSClient({ region: process.env.PRODUCT_AWS_REGION });

const sendNotification = async (
  TopicArn: string,
  Payload: FullProduct,
  MessageAttributes: Record<string, MessageAttributeValue>,
): Promise<void> => {
  try {
    const Message = JSON.stringify(Payload);
    const productId = Payload.id;

    const publishCommand = new PublishCommand({
      Subject: 'New files added to Catalog',
      Message,
      TopicArn,
      MessageAttributes,
    });

    logger.info(
      { Topic: TopicArn.split(':').pop(), productId, MessageAttributes },
      'Publish message to SNS',
    );

    await snsClient.send(publishCommand);
  } catch (error) {
    logger.error({ message: error.message, Payload }, SNS_ERROR);
    throw error;
  }
};

const notifyAboutProductCreate = async (notificationPayload: FullProduct): Promise<void> => {
  const { CREATE_PRODUCT_TOPIC_ARN } = process.env;

  const MessageAttributes: Record<string, MessageAttributeValue> = {
    publishTime: {
      DataType: 'String',
      StringValue: new Date().toISOString(),
    },
    count: {
      DataType: 'Number',
      StringValue: String(notificationPayload.count),
    },
  };

  await sendNotification(CREATE_PRODUCT_TOPIC_ARN, notificationPayload, MessageAttributes);
};

export { notifyAboutProductCreate };
