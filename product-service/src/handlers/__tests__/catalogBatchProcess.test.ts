import { SQSEvent, Context } from 'aws-lambda';

const catalogBatchProcess = jest.fn();
jest.mock('product/index', () => ({ catalogBatchProcess }));

import { handler } from 'handlers/catalogBatchProcess';

describe('catalogBatchProcess', () => {
  const event = ({} as unknown) as SQSEvent;
  const context = {} as Context;
  const callback = () => {
    throw new Error('Should never been called');
  };

  it('should call function with business logic', async () => {
    await handler(event, context, callback);

    expect(catalogBatchProcess).toBeCalledWith(context, event);
  });
});
