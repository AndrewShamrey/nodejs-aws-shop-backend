import { HttpApi, HttpMethod, CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { App, Stack } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dotenv from 'dotenv';

dotenv.config();

const STACK_NAME = `${process.env.COURSE_NAME}-${process.env.APP_NAME}-stack`;

const app = new App();
const stack = new Stack(app, process.env.STACK_ID, {
  stackName: STACK_NAME,
  env: { region: process.env.DEFAULT_REGION },
  description: 'The Cloud Formation Stack to manage Product Service resources',
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.DEFAULT_REGION,
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
