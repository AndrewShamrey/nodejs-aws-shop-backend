import { Context } from 'aws-lambda';
import { wrapWithTransaction } from 'product/db/utils/transaction';
import { createProductHandler } from 'product/db/handlers/createProductHandler';
import { FullProduct, Product, Stock } from 'interfaces/index';

export const createProductInTable = async (
  context: Context,
  product: Product,
  stock: Stock,
): Promise<FullProduct> => {
  return wrapWithTransaction(context, createProductHandler, product, stock) as Promise<FullProduct>;
};
