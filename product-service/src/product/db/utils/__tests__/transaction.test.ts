import { Context } from 'aws-lambda';
import { fullProduct } from '__testUtils__/samples/fullProduct';
import { product } from '__testUtils__/samples/product';
import { stock } from '__testUtils__/samples/stock';
import BadRequestError from 'core/errors/BadRequestError';
import TimeoutError from 'core/errors/TimeoutError';

const context = {
  getRemainingTimeInMillis: () => 60 * 1000,
} as Context;

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
};

const mockKnexInstance = {
  transaction: jest.fn().mockResolvedValue(mockTransaction),
  destroy: jest.fn(),
};

const getKnexInstance = jest.fn().mockReturnValue(mockKnexInstance);
jest.mock('product/db/utils/getKnexInstance', () => ({ default: getKnexInstance }));

import { wrapWithTransaction, throwErrorIfTimedOut } from 'product/db/utils/transaction';

describe('wrapWithTransaction', () => {
  it('should wrap the handler function with a transaction and commit changes', async () => {
    const handler = jest.fn().mockResolvedValue(fullProduct);
    const promise = await wrapWithTransaction(context, handler, product, stock);

    expect(promise).toEqual(fullProduct);
    expect(handler).toBeCalledWith(mockTransaction, product, stock);
    expect(getKnexInstance).toBeCalled();
    expect(mockTransaction.commit).toBeCalled();
    expect(mockKnexInstance.destroy).toBeCalled();
  });

  it('should handle errors, rollback changes, and throw error', async () => {
    const mockError = new Error('Mock error');
    const handler = jest.fn().mockRejectedValue(mockError);
    const promise = wrapWithTransaction(context, handler, product, stock);

    await expect(promise).rejects.toThrow(mockError);

    expect(handler).toBeCalledWith(mockTransaction, product, stock);
    expect(getKnexInstance).toBeCalled();
    expect(mockTransaction.rollback).toBeCalledWith(mockError);
    expect(mockKnexInstance.destroy).toBeCalled();
  });

  it('should handle errors, rollback changes, and throw BadRequestError for duplicated record', async () => {
    const mockError = new Error('duplicate key value');
    const handler = jest.fn().mockRejectedValue(mockError);
    const promise = wrapWithTransaction(context, handler, product, stock);

    await expect(promise).rejects.toThrow(BadRequestError);

    expect(handler).toBeCalledWith(mockTransaction, product, stock);
    expect(getKnexInstance).toBeCalled();
    expect(mockTransaction.rollback).toBeCalledWith(mockError);
    expect(mockKnexInstance.destroy).toBeCalled();
  });
});

describe('throwErrorIfTimedOut', () => {
  it('should throw a TimeoutError after the specified time', async () => {
    const mockMs = 1000;
    jest.useFakeTimers();
    const timeoutPromise = throwErrorIfTimedOut(mockMs);

    jest.advanceTimersByTime(mockMs);

    await expect(timeoutPromise).rejects.toThrow(TimeoutError);

    jest.useRealTimers();
  });
});
