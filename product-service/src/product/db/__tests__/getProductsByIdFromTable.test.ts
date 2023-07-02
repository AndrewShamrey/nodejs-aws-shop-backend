import { fullProduct } from '__testUtils__/samples/fullProduct';
import logger from 'utils/logger';

const mockKnexInstance = {
  join: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  then: jest.fn().mockReturnValue([fullProduct]),
};

const FN = () => mockKnexInstance;
const destroy = jest.fn();
FN.destroy = destroy;

const getKnexInstance = jest.fn().mockReturnValue(FN);
jest.mock('product/db/utils/getKnexInstance', () => ({ default: getKnexInstance }));

import { getProductsByIdFromTable } from 'product/db/getProductsByIdFromTable';

describe('getProductsByIdFromTable', () => {
  const productId = 'example-id';
  const productsTable = 'example-products-table';
  const stocksTable = 'example-stocks-table';
  process.env.PG_PRODUCTS_TABLE = productsTable;
  process.env.PG_STOCKS_TABLE = stocksTable;

  it('should query the database with the correct parameters', async () => {
    const result = await getProductsByIdFromTable(productId);

    expect(getKnexInstance).toBeCalled();
    expect(mockKnexInstance.join).toBeCalledWith(
      stocksTable,
      `${productsTable}.id`,
      `${stocksTable}.product_id`,
    );
    expect(mockKnexInstance.select).toBeCalledWith(`${productsTable}.*`, `${stocksTable}.count`);
    expect(mockKnexInstance.where).toBeCalledWith({ [`${productsTable}.id`]: productId });
    expect(mockKnexInstance.then).toBeCalled();
    expect(result).toEqual(fullProduct);
    expect(destroy).toBeCalled();
  });

  it('should throw if there is an error during the query', async () => {
    const errorMock = new Error('Database query error');
    mockKnexInstance.then.mockRejectedValueOnce(errorMock);

    await expect(getProductsByIdFromTable(productId)).rejects.toThrowError(errorMock);
    expect(logger.error).toBeCalledWith(
      { productId, error: errorMock },
      'Get Product by Id failed',
    );
    expect(destroy).toBeCalled();
  });
});
