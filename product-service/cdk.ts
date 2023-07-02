import { HttpApi, HttpMethod, CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { App, Stack, Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Topic, Subscription, SubscriptionProtocol, SubscriptionFilter } from 'aws-cdk-lib/aws-sns';
import * as dotenv from 'dotenv';

dotenv.config();

const STACK_NAME = `${process.env.COURSE_NAME}-${process.env.APP_NAME}-stack`;
const COMMON_LAMBDA_TIMEOUT = 5;
const SQS_BATCH_SIZE = 5;
const SUBSCRIPTION_NUMERIC_FILTER_FOR_COUNT = 10;

const app = new App();
const stack = new Stack(app, process.env.STACK_ID, {
  stackName: STACK_NAME,
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.DEFAULT_REGION,
  },
  description: 'The Cloud Formation Stack to manage Product Service resources',
});

const catalogItemsQueue = new Queue(stack, process.env.CATALOG_ITEMS_QUEUE_ID, {
  queueName: process.env.CATALOG_ITEMS_QUEUE_NAME,
});

const createProductTopic = new Topic(stack, process.env.CREATE_PRODUCT_TOPIC_ID, {
  topicName: process.env.CREATE_PRODUCT_TOPIC_NAME,
});

new Subscription(stack, process.env.CREATE_PRODUCT_TOPIC_SUBSCRIPTION_COMMON, {
  endpoint: process.env.COMMON_SUBSCRIPTION_EMAIL,
  protocol: SubscriptionProtocol.EMAIL,
  topic: createProductTopic,
});

new Subscription(stack, process.env.CREATE_PRODUCT_TOPIC_SUBSCRIPTION_FILTERED, {
  endpoint: process.env.FILTERED_SUBSCRIPTION_EMAIL,
  protocol: SubscriptionProtocol.EMAIL,
  topic: createProductTopic,
  filterPolicy: {
    count: SubscriptionFilter.numericFilter({
      lessThanOrEqualTo: SUBSCRIPTION_NUMERIC_FILTER_FOR_COUNT,
    }),
  },
});

const vpc = Vpc.fromLookup(stack, process.env.DEFAULT_VPC_FOR_LAMBDAS_ID, { vpcId: process.env.DEFAULT_VPC_ID });

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: Runtime.NODEJS_18_X,
  timeout: Duration.seconds(COMMON_LAMBDA_TIMEOUT),
  vpc,
  allowPublicSubnet: true,
  environment: {
    PG_HOST: process.env.PG_HOST,
    PG_PORT: process.env.PG_PORT,
    PG_USERNAME: process.env.PG_USERNAME,
    PG_PASSWORD: process.env.PG_PASSWORD,
    PG_DATABASE: process.env.PG_DATABASE,
    PG_PRODUCTS_TABLE: process.env.PG_PRODUCTS_TABLE,
    PG_STOCKS_TABLE: process.env.PG_STOCKS_TABLE,
    PRODUCT_AWS_REGION: process.env.DEFAULT_REGION,
    CREATE_PRODUCT_TOPIC_ARN: createProductTopic.topicArn,
  },
  bundling: {
    externalModules: [
      'pg-native',
      'sqlite3',
      'pg-query-stream',
      'oracledb',
      'better-sqlite3',
      'tedious',
      'mysql',
      'mysql2',
    ],
  },
};

const getProductsList = new NodejsFunction(stack, process.env.PRODUCTS_LIST_LAMBDA_ID, {
  ...sharedLambdaProps,
  functionName: process.env.PRODUCTS_LIST_LAMBDA_NAME,
  entry: 'src/handlers/getProductsList.ts',
  description: 'Lambda Function to get full array of products',
});

const getProductsById = new NodejsFunction(stack, process.env.PRODUCTS_BY_ID_LAMBDA_ID, {
  ...sharedLambdaProps,
  functionName: process.env.PRODUCTS_BY_ID_LAMBDA_NAME,
  entry: 'src/handlers/getProductsById.ts',
  description: 'Lambda Function to get product by id',
});

const createProduct = new NodejsFunction(stack, process.env.CREATE_PRODUCTS_LAMBDA_ID, {
  ...sharedLambdaProps,
  functionName: process.env.CREATE_PRODUCTS_LAMBDA_NAME,
  entry: 'src/handlers/createProduct.ts',
  description: 'Lambda Function to create new product',
});

const catalogBatchProcess = new NodejsFunction(stack, process.env.CATALOG_BATCH_PROCESS_LAMBDA_ID, {
  ...sharedLambdaProps,
  functionName: process.env.CATALOG_BATCH_PROCESS_LAMBDA_NAME,
  entry: 'src/handlers/catalogBatchProcess.ts',
  description: 'Lambda Function to handle messages from sqs',
});

createProductTopic.grantPublish(catalogBatchProcess);
catalogBatchProcess.addEventSource(
  new SqsEventSource(catalogItemsQueue, { batchSize: SQS_BATCH_SIZE }),
);

const api = new HttpApi(stack, process.env.API_ID, {
  corsPreflight: {
    allowHeaders: ['*'],
    allowOrigins: ['*'],
    allowMethods: [CorsHttpMethod.ANY],
  },
  description: 'API Gateway Proxy to manage requests to Products Lambdas',
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    process.env.PRODUCTS_LIST_LAMBDA_INTEGRATION,
    getProductsList,
  ),
  path: '/products',
  methods: [HttpMethod.GET],
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    process.env.PRODUCTS_BY_ID_LAMBDA_INTEGRATION,
    getProductsById,
  ),
  path: '/products/{productId}',
  methods: [HttpMethod.GET],
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    process.env.CREATE_PRODUCTS_LAMBDA_INTEGRATION,
    createProduct,
  ),
  path: '/products',
  methods: [HttpMethod.POST],
});
