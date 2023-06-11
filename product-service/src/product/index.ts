import { products } from 'mocks/product';
import { ResponseBodyProduct, ResponseBodyProductsList } from 'interfaces/index';

const getProductsList = async (): Promise<ResponseBodyProductsList> => {
  return products;
};

const getProductsById = async (id: string): Promise<ResponseBodyProduct> => {
  return products.find(({ productId }) => productId === id);
};

export { getProductsList, getProductsById };
