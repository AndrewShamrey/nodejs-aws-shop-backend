import { Knex } from 'knex';
import { Product, Stock, FullProduct } from 'interfaces/index';

const prepareFullProduct = (product: Product, stock: Stock): FullProduct => {
  const fullProduct: FullProduct = {
    ...product,
    count: stock.count,
  };

  return fullProduct;
};

const createProductHandler = async (
  trx: Knex.Transaction,
  product: Product,
  stock: Stock,
): Promise<FullProduct> => {
  const createProductQuery = trx<Product>(process.env.PG_PRODUCTS_TABLE)
    .insert<Product[]>(product)
    .returning('*');

  const createStockQuery = trx<Stock>(process.env.PG_STOCKS_TABLE)
    .insert<Stock[]>(stock)
    .returning('*');

  const [productRecord] = await createProductQuery.then((v) => v);
  const [stockRecord] = await createStockQuery.then((v) => v);

  return prepareFullProduct(productRecord, stockRecord);
};

export { createProductHandler };
