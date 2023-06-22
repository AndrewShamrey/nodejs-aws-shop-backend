import { Context } from 'aws-lambda';
import { fullProduct } from '__testUtils__/samples/fullProduct';
import { product } from '__testUtils__/samples/product';
import { stock } from '__testUtils__/samples/stock';

const wrapWithTransaction = jest.fn().mockResolvedValue(fullProduct);
jest.mock('product/db/utils/transaction', () => ({ wrapWithTransaction }));

const createProductHandler = jest.fn();
jest.mock('product/db/handlers/createProductHandler', () => ({ createProductHandler }));

import { createProductInTable } from 'product/db/createProductInTable';

describe('createProductInTable', () => {
  it('should call transaction for create new record', async () => {
    const context = {} as Context;

    const result = await createProductInTable(context, product, stock);

    expect(wrapWithTransaction).toBeCalledWith(context, createProductHandler, product, stock);
    expect(result).toEqual(fullProduct);
  });
});
