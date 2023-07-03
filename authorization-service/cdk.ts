import { App, Stack, Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dotenv from 'dotenv';

dotenv.config();

const STACK_NAME = `${process.env.COURSE_NAME}-${process.env.APP_NAME}-stack`;

const app = new App();
const stack = new Stack(app, process.env.STACK_ID, {
  stackName: STACK_NAME,
  env: { region: process.env.DEFAULT_REGION },
  description: 'The Cloud Formation Stack to manage Authorization Service resources',
});

new NodejsFunction(stack, process.env.BASIC_AUTHORIZER_LAMBDA_ID, {
  runtime: Runtime.NODEJS_18_X,
  timeout: Duration.seconds(3),
  environment: {
    AUTH_AWS_REGION: process.env.DEFAULT_REGION,
    [process.env.TEST_USER_NAME]: process.env.TEST_USER_PASSWORD,
  },
  functionName: process.env.BASIC_AUTHORIZER_LAMBDA_NAME,
  entry: 'src/handlers/basicAuthorizer.ts',
  description: 'Authorizer Lambda Function',
});
