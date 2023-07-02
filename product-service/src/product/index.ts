import { Context, SQSEvent } from 'aws-lambda';
import { v4 } from 'uuid';
import { clean } from 'utils/object';
import { validatePayload } from 'product/validation';
import { getProductsListFromTable } from 'product/db/getProductsListFromTable';
import { getProductsByIdFromTable } from 'product/db/getProductsByIdFromTable';
import { createProductInTable } from 'product/db/createProductInTable';
import { notifyAboutProductCreate } from 'product/sns';
import {
  FullProduct,
  Product,
  Stock,
  RequestBodyProductCreate,
  ResponseBodyProduct,
  ResponseBodyProductsList,
} from 'interfaces/index';
import logger from 'utils/logger';

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

const catalogBatchProcess = async (context: Context, event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const productPayload: Omit<FullProduct, 'id'> = JSON.parse(record.body);
    const product = await createProduct(context, productPayload);

    logger.info({ productId: product.id }, 'Product created in database');

    await notifyAboutProductCreate(product);
  }
};

export { getProductsList, getProductsById, createProduct, catalogBatchProcess };
