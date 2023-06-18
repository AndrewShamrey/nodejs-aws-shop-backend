import { S3Event, Context } from 'aws-lambda';

const importFileParser = jest.fn();
jest.mock('import/index', () => ({ importFileParser }));

import { handler } from 'handlers/importFileParser';

describe('importFileParser', () => {
  const event = ({} as unknown) as S3Event;
  const context = {} as Context;
  const callback = () => {
    throw new Error('Should never been called');
  };

  it('should call function with business logic', async () => {
    await handler(event, context, callback);

    expect(importFileParser).toBeCalledWith(event);
  });
});
