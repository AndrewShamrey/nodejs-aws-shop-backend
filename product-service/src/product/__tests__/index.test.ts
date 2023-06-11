import { Context } from 'aws-lambda';
import { fullProduct, fullProductsList } from '__testUtils__/samples/fullProduct';
import { getProductsList, getProductsById, createProduct } from 'product/index';
import { Product, Stock, RequestBodyProductCreate } from 'interfaces/index';

const getProductsListFromTable = jest.fn().mockResolvedValue(fullProductsList);
const getProductsByIdFromTable = jest.fn().mockResolvedValue(fullProduct);
const createProductInTable = jest.fn().mockResolvedValue(fullProduct);
const validatePayload = jest.fn();
const uniqueId = 'productId';

jest.mock('product/db/getProductsListFromTable', () => ({ getProductsListFromTable }));
jest.mock('product/db/getProductsByIdFromTable', () => ({ getProductsByIdFromTable }));
jest.mock('product/db/createProductInTable', () => ({ createProductInTable }));
jest.mock('product/validation', () => ({ validatePayload }));
jest.mock('uuid', () => ({ v4: () => uniqueId }));

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
    const result = await createProduct(context, mockPayload);
    const product: Product = { ...productData, id: uniqueId };
    const stock: Stock = { ...stockData, product_id: uniqueId };

    expect(validatePayload).toBeCalledWith(product, stock);
    expect(createProductInTable).toBeCalledWith(context, product, stock);
    expect(result).toEqual({
      id: uniqueId,
      ...mockPayload,
    });
  });
});
