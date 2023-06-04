const runTime = new Date(2023, 6, 4);
const runId = 'fakeRunId';
const data = { key: 'value' };
const message = 'Info message';

describe('logger', () => {
  let logs: string[] = [];

  afterEach(() => {
    logs = [];
  });

  beforeAll(() => {
    jest.unmock('utils/logger');
    jest.useFakeTimers('modern');
    jest.setSystemTime(runTime);
    jest.mock('uuid', () => ({ v4: () => runId }));

    global['testStdout'] = {
      write: (text: string) => {
        logs.push(text);
      },
    };
  });

  afterAll(() => {
    jest.mock('utils/logger');
    jest.useRealTimers();
    delete global['testStdout'];
  });

  it('should has all necessary logger methods', async () => {
    const logger = require('utils/logger').default;

    expect(logger.info).toBeInstanceOf(Function);
    expect(logger.warn).toBeInstanceOf(Function);
    expect(logger.error).toBeInstanceOf(Function);
    expect(logger.runtimeInfo).toBeInstanceOf(Function);
  });

  describe('runtimeInfo', () => {
    it('should log the runtime information', () => {
      const logger = require('utils/logger').default;
      logger.runtimeInfo();

      expect(logs.length).toBe(1);
      expect(logs[0]).toContain('INFO');
      expect(logs[0]).toContain(runTime.toISOString());
      expect(logs[0]).toContain(runId);
    });
  });

  describe('info', () => {
    it('should log the info message', () => {
      const logger = require('utils/logger').default;
      logger.info(data, message);

      expect(logs.length).toBe(1);
      expect(logs[0]).toContain('INFO');
      expect(logs[0]).toContain(JSON.stringify(data));
      expect(logs[0]).toContain(message);
    });
  });

  describe('warn', () => {
    it('should log the warn message', () => {
      const logger = require('utils/logger').default;
      logger.warn(data, message);

      expect(logs.length).toBe(1);
      expect(logs[0]).toContain('WARN');
      expect(logs[0]).toContain(JSON.stringify(data));
      expect(logs[0]).toContain(message);
    });
  });

  describe('error', () => {
    it('should log the error message', () => {
      const logger = require('utils/logger').default;
      logger.error(data, message);

      expect(logs.length).toBe(1);
      expect(logs[0]).toContain('ERROR');
      expect(logs[0]).toContain(JSON.stringify(data));
      expect(logs[0]).toContain(message);
    });
  });
});
