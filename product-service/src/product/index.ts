import { Context } from 'aws-lambda';
import { v4 } from 'uuid';
import { clean } from 'utils/object';
import { validatePayload } from 'product/validation';
import { getProductsListFromTable } from 'product/db/getProductsListFromTable';
import { getProductsByIdFromTable } from 'product/db/getProductsByIdFromTable';
import { createProductInTable } from 'product/db/createProductInTable';
import {
  Product,
  Stock,
  RequestBodyProductCreate,
  ResponseBodyProduct,
  ResponseBodyProductsList,
} from 'interfaces/index';

const getProductsList = async (): Promise<ResponseBodyProductsList> => getProductsListFromTable();

const getProductsById = async (productId: string): Promise<ResponseBodyProduct> =>
  getProductsByIdFromTable(productId);

const createProduct = async (
  context: Context,
  payload: RequestBodyProductCreate,
): Promise<ResponseBodyProduct> => {
  const productId = v4();
  const { title, price, count, description } = payload;

  const product: Product = clean({
    id: productId,
    title,
    price,
    description,
  });

  const stock: Stock = clean({
    product_id: productId,
    count,
  });

  await validatePayload(product, stock);

  const createdProduct = createProductInTable(context, product, stock);

  return createdProduct;
};

export { getProductsList, getProductsById, createProduct };
