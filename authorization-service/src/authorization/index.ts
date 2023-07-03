import { APIGatewayAuthorizerResult } from 'aws-lambda';
import { allowPolicy } from 'authorization/policies/allowPolicy';
import { denyAllPolicy } from 'authorization/policies/denyAllPolicy';
import logger from 'utils/logger';

const getDefinedPasswordFromEnv = (name: string): string => {
  const envValue = process.env[name];
  if (!envValue) throw new Error(`Cannot find credentials for '${name}' in process env`);
  return envValue;
};

const basicAuthorizer = (authorizationToken: string): APIGatewayAuthorizerResult => {
  try {
    const token = authorizationToken.split(' ').pop();
    const [login, password] = Buffer.from(token, 'base64').toString().split(':');
    const passwordFromEnv = getDefinedPasswordFromEnv(login);

    if (passwordFromEnv !== password) throw new Error('Password mismatch');

    logger.info({ login }, 'Success authorization');
    return allowPolicy(login);
  } catch (error) {
    logger.error({ message: error.message }, 'Authorization Error');
    return denyAllPolicy();
  }
};

export { basicAuthorizer };
