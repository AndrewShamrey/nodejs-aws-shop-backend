import { validateProductPayload, validateStockPayload } from 'product/validation';
import { product } from '__testUtils__/samples/product';
import { stock } from '__testUtils__/samples/stock';
import { Product, Stock } from 'interfaces/index';
import BadRequestError from 'core/errors/BadRequestError';

describe('validateProductPayload', () => {
  it('should not throw an error for a valid product', async () => {
    const result = await validateProductPayload(product);
    expect(result).toBeUndefined();
  });

  it('should throw a BadRequestError for an invalid product', async () => {
    await expect(
      validateProductPayload({
        id: 'b86a2f92-dee4-4f4f-a300-fd811ccfb7d3',
        title: 'Product 1',
      } as Product),
    ).rejects.toThrow(BadRequestError);

    await expect(
      validateProductPayload({
        id: '1',
        title: 'Product 1',
        price: 5,
      } as Product),
    ).rejects.toThrow(BadRequestError);

    await expect(
      validateProductPayload({
        id: 'b86a2f92-dee4-4f4f-a300-fd811ccfb7d3',
        title: 'Product 1',
        price: -5,
      } as Product),
    ).rejects.toThrow(BadRequestError);

    await expect(
      validateProductPayload({
        id: 'b86a2f92-dee4-4f4f-a300-fd811ccfb7d3',
        title: '',
        price: 5,
        description: 'test',
      } as Product),
    ).rejects.toThrow(BadRequestError);
  });

  it('should throw a BadRequestError for product with additional properties', async () => {
    await expect(
      validateProductPayload({
        id: 'b86a2f92-dee4-4f4f-a300-fd811ccfb7d3',
        title: 'Product 2',
        price: 2,
        additionalProperty: true,
      } as Product),
    ).rejects.toThrow(BadRequestError);
  });
});

describe('validateStockPayload', () => {
  it('should not throw an error for a valid stock', async () => {
    const result = await validateStockPayload(stock);
    expect(result).toBeUndefined();
  });

  it('should throw a BadRequestError for an invalid stock', async () => {
    await expect(
      validateStockPayload({
        product_id: 'b86a2f92-dee4-4f4f-a300-fd811ccfb7d3',
      } as Stock),
    ).rejects.toThrow(BadRequestError);

    await expect(
      validateStockPayload({
        product_id: 'b86a2f92-dee4-4f4f-a300-fd811ccfb7d3',
        count: -2,
      } as Stock),
    ).rejects.toThrow(BadRequestError);

    await expect(
      validateStockPayload({
        product_id: '2',
        count: 2,
      } as Stock),
    ).rejects.toThrow(BadRequestError);
  });

  it('should throw a BadRequestError for product with additional properties', async () => {
    await expect(
      validateStockPayload({
        product_id: 'b86a2f92-dee4-4f4f-a300-fd811ccfb7d3',
        count: 2,
        additionalProperty: true,
      } as Stock),
    ).rejects.toThrow(BadRequestError);
  });
});
