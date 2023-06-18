import { validateProductPayload, validateStockPayload, validatePayload } from 'product/validation';
import { product } from '__testUtils__/samples/product';
import { stock } from '__testUtils__/samples/stock';
import { Product, Stock } from 'interfaces/index';
import BadRequestError from 'core/errors/BadRequestError';

describe('validateProductPayload', () => {
  it('should not throw an error for a valid product', async () => {
    await expect(validateProductPayload(product)).rejects.not.toThrow();
  });

  it('should throw a BadRequestError for an invalid product', async () => {
    await expect(
      validateProductPayload({
        id: '1',
        title: 'Product 1',
        // Missing required 'price' field
      } as Product),
    ).rejects.toThrow(BadRequestError);
  });

  it('should throw a BadRequestError for product with additional properties', async () => {
    await expect(
      validateProductPayload({
        id: '2',
        title: 'Product 2',
        price: 2,
        additionalProperty: true, // not exists in Product type
      } as Product),
    ).rejects.toThrow(BadRequestError);
  });
});

describe('validateStockPayload', () => {
  it('should not throw an error for a valid stock', async () => {
    await expect(validateStockPayload(stock)).rejects.not.toThrow();
  });

  it('should throw a BadRequestError for an invalid stock', async () => {
    await expect(
      validateStockPayload({
        product_id: '1',
        // Missing required 'count' field
      } as Stock),
    ).rejects.toThrow(BadRequestError);
  });

  it('should throw a BadRequestError for product with additional properties', async () => {
    await expect(
      validateStockPayload({
        product_id: '2',
        count: 2,
        additionalProperty: true, // not exists in Stock type
      } as Stock),
    ).rejects.toThrow(BadRequestError);
  });
});

describe('validatePayload', () => {
  const validateProductPayloadMock = jest.spyOn(
    require('product/validation'),
    'validateProductPayload',
  );
  const validateStockPayloadMock = jest.spyOn(
    require('product/validation'),
    'validateStockPayload',
  );

  it('should run validators for provided product and stock', async () => {
    await validatePayload(product, stock);

    expect(validateProductPayloadMock).toBeCalledWith(product);
    expect(validateStockPayloadMock).toBeCalledWith(stock);
  });
});
