import { HttpApi, HttpMethod, CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { App, Stack, Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Vpc, SubnetType } from 'aws-cdk-lib/aws-ec2';
import * as dotenv from 'dotenv';

dotenv.config();

const STACK_NAME = `${process.env.COURSE_NAME}-${process.env.APP_NAME}-stack`;

const app = new App();
const stack = new Stack(app, process.env.STACK_ID, {
  stackName: STACK_NAME,
  env: { region: process.env.DEFAULT_REGION },
  description: 'The Cloud Formation Stack to manage Product Service resources',
});

const vpc = new Vpc(stack, process.env.LAMBDA_VPC_ID, {
  cidr: Vpc.DEFAULT_CIDR_RANGE,
  subnetConfiguration: [
    {
      name: process.env.VPC_PRIVATE_SUBNET_NAME,
      subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      cidrMask: 24,
    },
    {
      name: process.env.VPC_PUBLIC_SUBNET_NAME,
      subnetType: SubnetType.PUBLIC,
      cidrMask: 24,
    },
    {
      name: process.env.VPC_ISOLATED_SUBNET_NAME,
      subnetType: SubnetType.PRIVATE_ISOLATED,
      cidrMask: 28,
    },
  ],
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: Runtime.NODEJS_18_X,
  timeout: Duration.seconds(5),
  vpc,
  vpcSubnets: {
    subnetType: SubnetType.PRIVATE_WITH_EGRESS,
  },
  environment: {
    PG_HOST: process.env.PG_HOST,
    PG_PORT: process.env.PG_PORT,
    PG_USERNAME: process.env.PG_USERNAME,
    PG_PASSWORD: process.env.PG_PASSWORD,
    PG_DATABASE: process.env.PG_DATABASE,
    PG_PRODUCTS_TABLE: process.env.PG_PRODUCTS_TABLE,
    PG_STOCKS_TABLE: process.env.PG_STOCKS_TABLE,
    PRODUCT_AWS_REGION: process.env.DEFAULT_REGION,
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
