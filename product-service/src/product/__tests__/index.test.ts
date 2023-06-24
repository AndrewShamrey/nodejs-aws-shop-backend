import { Context, SQSEvent } from 'aws-lambda';
import { fullProduct, fullProductsList } from '__testUtils__/samples/fullProduct';
import { Product, Stock, RequestBodyProductCreate } from 'interfaces/index';

const notifyAboutProductCreate = jest.fn();
const getProductsListFromTable = jest.fn().mockResolvedValue(fullProductsList);
const getProductsByIdFromTable = jest.fn().mockResolvedValue(fullProduct);
const createProductInTable = jest.fn().mockResolvedValue(fullProduct);
const validatePayload = jest.fn();
const uniqueId = 'productId';

jest.mock('product/sns', () => ({ notifyAboutProductCreate }));
jest.mock('product/db/getProductsListFromTable', () => ({ getProductsListFromTable }));
jest.mock('product/db/getProductsByIdFromTable', () => ({ getProductsByIdFromTable }));
jest.mock('product/db/createProductInTable', () => ({ createProductInTable }));
jest.mock('product/validation', () => ({ validatePayload }));
jest.mock('uuid', () => ({ v4: () => uniqueId }));

import {
  getProductsList,
  getProductsById,
  createProduct,
  catalogBatchProcess,
} from 'product/index';

describe('getProductsList', () => {
  it('should run getProductsListFromTable', async () => {
    const result = await getProductsList();
    expect(result).toEqual(fullProductsList);
  });
});

describe('getProductsById', () => {
  it('should run getProductsByIdFromTable', async () => {
    const result = await getProductsById(fullProduct.id);
    expect(result).toEqual(fullProduct);
  });
});

describe('createProduct', () => {
  const context = {} as Context;
  const productData = {
    title: 'Product 1',
    price: 10,
    description: 'Description 1',
  };

  const stockData = {
    count: 5,
  };

  const mockPayload: RequestBodyProductCreate = {
    ...productData,
    ...stockData,
  };

  it('should create a product with specified payload', async () => {
    await createProduct(context, mockPayload);
    const product: Product = { ...productData, id: uniqueId };
    const stock: Stock = { ...stockData, product_id: uniqueId };

    expect(validatePayload).toBeCalledWith(product, stock);
    expect(createProductInTable).toBeCalledWith(context, product, stock);
  });
});

describe('catalogBatchProcess', () => {
  const context = {} as Context;
  const productsDetails1 = {
    title: 'Product 1',
    description: 'Description 1',
    price: 10,
    count: 5,
  };
  const productsDetails2 = {
    title: 'Product 2',
    description: 'Description 2',
    price: 20,
    count: 15,
  };

  const event = {
    Records: [
      { body: JSON.stringify(productsDetails1) },
      { body: JSON.stringify(productsDetails2) },
    ],
  } as SQSEvent;

  it('should create a product and send notification for each record', async () => {
    await catalogBatchProcess(context, event);

    expect(validatePayload).toBeCalledTimes(event.Records.length);
    expect(createProductInTable).toBeCalledTimes(event.Records.length);
    expect(notifyAboutProductCreate).toBeCalledTimes(event.Records.length);
  });
});
