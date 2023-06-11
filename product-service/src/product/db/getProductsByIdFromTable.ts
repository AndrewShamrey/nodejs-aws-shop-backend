import getKnexInstance from 'product/db/utils/getKnexInstance';
import { Product, FullProduct, FullProductsList } from 'interfaces/index';
import logger from 'utils/logger';

export const getProductsByIdFromTable = async (productId: Product['id']): Promise<FullProduct> => {
  const { PG_PRODUCTS_TABLE, PG_STOCKS_TABLE } = process.env;
  const knex = getKnexInstance();

  try {
    const productQuery = knex(PG_PRODUCTS_TABLE)
      .join(PG_STOCKS_TABLE, `${PG_PRODUCTS_TABLE}.id`, `${PG_STOCKS_TABLE}.product_id`)
      .select<FullProductsList>(`${PG_PRODUCTS_TABLE}.*`, `${PG_STOCKS_TABLE}.count`)
      .where({ [`${PG_PRODUCTS_TABLE}.id`]: productId });

    const [product] = await productQuery.then((v) => v);

    return product;
  } catch (error) {
    logger.error({ productId, error }, 'Get Product by Id failed');
    throw error;
  } finally {
    await knex.destroy();
  }
};
