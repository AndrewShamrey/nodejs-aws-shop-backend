import { Knex } from 'knex';
import { createProductHandler } from 'product/db/handlers/createProductHandler';
import { product } from '__testUtils__/samples/product';
import { stock } from '__testUtils__/samples/stock';

describe('createProductHandler', () => {
  it('should create a product and stock record and return the full product', async () => {
    const mockTransaction = {
      insert: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValueOnce([product]).mockResolvedValueOnce([stock]),
      then: jest.fn(),
    };

    const trx: Knex.Transaction = (mockTransaction as unknown) as Knex.Transaction;
    const fullProduct = await createProductHandler(trx, product, stock);

    expect(mockTransaction.insert).toBeCalledWith(product);
    expect(mockTransaction.insert).toBeCalledWith(stock);
    expect(mockTransaction.returning).toBeCalledWith('*');
    expect(mockTransaction.returning).toBeCalledTimes(2);

    expect(fullProduct).toEqual({
      ...product,
      count: stock.count,
    });
  });
});
