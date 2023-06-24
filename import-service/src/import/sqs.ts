import { SQSClient, SendMessageCommand, MessageAttributeValue } from '@aws-sdk/client-sqs';
import { ProductsDetails } from 'interfaces/index';
import { SQS_ERROR } from 'utils/constants';
import logger from 'utils/logger';

const sqsClient = new SQSClient({ region: process.env.IMPORT_AWS_REGION });

const sendMessage = async (
  QueueUrl: string,
  Payload: ProductsDetails,
  MessageAttributes: Record<string, MessageAttributeValue>,
): Promise<void> => {
  try {
    const MessageBody = JSON.stringify(Payload);

    const sendMessageCommand = new SendMessageCommand({
      MessageBody,
      QueueUrl,
      MessageAttributes,
    });

    logger.info(
      { QueueName: QueueUrl.split('/').pop(), MessageAttributes },
      'Publish message to SQS',
    );

    await sqsClient.send(sendMessageCommand);
  } catch (error) {
    logger.error({ message: error.message, Payload }, SQS_ERROR);
    throw error;
  }
};

const publishSQSEvent = async (messagePayload: ProductsDetails): Promise<void> => {
  const { IMPORT_QUEUE_URL } = process.env;

  const MessageAttributes: Record<string, MessageAttributeValue> = {
    publishTime: {
      DataType: 'String',
      StringValue: new Date().toISOString(),
    },
  };

  await sendMessage(IMPORT_QUEUE_URL, messagePayload, MessageAttributes);
};

export { publishSQSEvent };
