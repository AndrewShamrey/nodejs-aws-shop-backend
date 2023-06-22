import { pause } from 'utils/promise';

jest.useFakeTimers();

describe('pause', () => {
  it('should pause execution for at least specified amount of ms', async () => {
    const ms = 100;
    pause(ms);

    expect(setTimeout).toBeCalled();
  });
});
