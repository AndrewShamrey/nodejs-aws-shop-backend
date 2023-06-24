import { App, Stack, Duration } from 'aws-cdk-lib';
import { RestApi, Cors, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dotenv from 'dotenv';

dotenv.config();

const STACK_NAME = `${process.env.COURSE_NAME}-${process.env.APP_NAME}-stack`;
const BUCKET_NAME = `${process.env.COURSE_NAME}-${process.env.APP_NAME}-bucket`;

const app = new App();
const stack = new Stack(app, process.env.STACK_ID, {
  stackName: STACK_NAME,
  env: { region: process.env.DEFAULT_REGION },
  description: 'The Cloud Formation Stack to manage Import Service resources',
});

const bucket = Bucket.fromBucketName(stack, process.env.BUCKET_ID, BUCKET_NAME);

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: Runtime.NODEJS_18_X,
  timeout: Duration.seconds(5),
  environment: {
    IMPORT_AWS_REGION: process.env.DEFAULT_REGION,
    IMPORT_BUCKET_NAME: BUCKET_NAME,
    UPLOAD_FOLDER_NAME: process.env.UPLOAD_FOLDER_NAME,
    PARSED_FOLDER_NAME: process.env.PARSED_FOLDER_NAME,
  },
};

const importProductsFile = new NodejsFunction(stack, process.env.IMPORT_PRODUCTS_LAMBDA_ID, {
  ...sharedLambdaProps,
  functionName: process.env.IMPORT_PRODUCTS_LAMBDA_NAME,
  entry: 'src/handlers/importProductsFile.ts',
  description: 'Lambda Function to import products file',
});

const importFileParser = new NodejsFunction(stack, process.env.IMPORT_FILE_PARSER_LAMBDA_ID, {
  ...sharedLambdaProps,
  functionName: process.env.IMPORT_FILE_PARSER_LAMBDA_NAME,
  entry: 'src/handlers/importFileParser.ts',
  description: 'Lambda Function to parse csv file',
});

const api = new RestApi(stack, process.env.API_ID, {
  restApiName: process.env.API_NAME,
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: ['*'],
    allowCredentials: true,
  },
  description: 'API Gateway Proxy to manage requests to Import Lambdas',
});

api.root.addResource('import').addMethod('GET', new LambdaIntegration(importProductsFile), {
  requestParameters: { 'method.request.querystring.name': true },
});

bucket.grantReadWrite(importProductsFile);
bucket.grantReadWrite(importFileParser);
bucket.grantDelete(importFileParser);
bucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(importFileParser), {
  prefix: process.env.UPLOAD_FOLDER_NAME,
});
