import { products } from 'mocks/product';
import { getProductsList, getProductsById } from 'product/index';

describe('getProductsList', () => {
  it('should return products', async () => {
    const result = await getProductsList();
    expect(result).toEqual(products);
  });
});

describe('getProductsById', () => {
  it('should return product by id', async () => {
    const product = products[0];
    const result = await getProductsById(product.productId);
    expect(result).toEqual(product);
  });

  it('should return undefined when product does not exists', async () => {
    const result = await getProductsById('fakeId');
    expect(result).toBeUndefined();
  });
});
