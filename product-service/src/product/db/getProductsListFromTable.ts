import getKnexInstance from 'product/db/utils/getKnexInstance';
import { FullProductsList } from 'interfaces/index';
import logger from 'utils/logger';

export const getProductsListFromTable = async (): Promise<FullProductsList> => {
  const { PG_PRODUCTS_TABLE, PG_STOCKS_TABLE } = process.env;
  const knex = getKnexInstance();

  try {
    const productQuery = knex(PG_PRODUCTS_TABLE)
      .join(PG_STOCKS_TABLE, `${PG_PRODUCTS_TABLE}.id`, `${PG_STOCKS_TABLE}.product_id`)
      .select<FullProductsList>(`${PG_PRODUCTS_TABLE}.*`, `${PG_STOCKS_TABLE}.count`);

    const records = await productQuery.then((v) => v);

    return records;
  } catch (error) {
    logger.error({ error }, 'Get Products List failed');
    throw error;
  } finally {
    await knex.destroy();
  }
};
