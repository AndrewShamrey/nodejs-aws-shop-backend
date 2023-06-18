import { APIGatewayProxyEvent, APIGatewayProxyHandler, Context } from 'aws-lambda';
import { enableCORS, handleError, validateContentType } from 'core/decorators/helpers';
import { COMMON_LOGIC_ERROR } from 'utils/constants';
import Response from 'core/responses/Response';
import logger from 'utils/logger';

type HandlerFn<T, C, P> = (event: T, context: C) => Promise<P>;

const commonLogic = async <T, C, P>(
  event: unknown,
  context: Context,
  handler: HandlerFn<T, C, P>,
) => {
  logger.runtimeInfo();

  try {
    return await handler(event as T, context as C);
  } catch (error) {
    const { message } = error;
    logger.error({ message }, COMMON_LOGIC_ERROR);

    throw error;
  }
};

const apiGwProxy = <EventType = APIGatewayProxyEvent>(
  handler: (event: EventType, context: Context) => Promise<Response | unknown>,
): APIGatewayProxyHandler => async (awsEvent, awsContext) => {
  try {
    validateContentType(awsEvent);

    const result = await commonLogic(awsEvent, awsContext, handler);
    const backendResponse = Response.from(result).serialize();

    return enableCORS(backendResponse);
  } catch (error) {
    logger.error({ error });
    return handleError(error);
  }
};

export { apiGwProxy };
