import { Context } from 'aws-lambda';
import { Knex } from 'knex';
import getKnexInstance from 'product/db/utils/getKnexInstance';
import BadRequestError from 'core/errors/BadRequestError';
import TimeoutError from 'core/errors/TimeoutError';
import { pause } from 'utils/promise';
import { TRANSACTION_ROLLBACK } from 'utils/constants';
import { FullProduct, FullProductsList, Product, Stock } from 'interfaces/index';
import logger from 'utils/logger';

const throwErrorIfTimedOut = async (ms: number): Promise<never> => {
  await pause(ms);

  throw new TimeoutError('Connection is timed out');
};

const wrapWithTransaction = async (
  context: Context,
  handler: (
    trx: Knex.Transaction,
    product?: Product,
    stock?: Stock,
  ) => Promise<FullProductsList | FullProduct>,
  product?: Product,
  stock?: Stock,
): Promise<FullProductsList | FullProduct> => {
  const knex = getKnexInstance();

  const productId = product?.id;

  let trx: Knex.Transaction;

  try {
    trx = await Promise.race([
      throwErrorIfTimedOut(context.getRemainingTimeInMillis() - 500),
      knex.transaction(),
    ]);

    const record = await handler(trx, product, stock);

    await trx.commit();

    return record;
  } catch (error) {
    const { message } = error;

    await trx?.rollback(error);

    logger.error({ productId, message }, TRANSACTION_ROLLBACK);

    if (!String(error['message']).includes('duplicate key value')) {
      throw error;
    }

    throw new BadRequestError('Product with same id already exists', { productId });
  } finally {
    await knex.destroy();
  }
};

export { wrapWithTransaction, throwErrorIfTimedOut };
