import { v4 } from 'uuid';

const runTime = new Date().toISOString();
const runId = v4();
const target = process.env.IS_TEST ? global['testStdout'] : console;

enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface Logger {
  info: (data: unknown, message?: string) => void;
  warn: (data: unknown, message?: string) => void;
  error: (data: unknown, message?: string) => void;
  runtimeInfo?: () => void;
}

const createLogger = (): Logger => {
  const log = (level: LogLevel, data: unknown, message?: string): void => {
    const preparedData = JSON.stringify(data);
    const logEntry = `${level}${message ? '\t' + message : ''}\t${preparedData}`;
    target.log(logEntry);
  };

  return {
    info: (data, message) => log(LogLevel.INFO, data, message),
    warn: (data, message) => log(LogLevel.WARN, data, message),
    error: (data, message) => log(LogLevel.ERROR, data, message),
  };
};

const logger: Logger = createLogger();
logger.runtimeInfo = function () {
  this.info({ runTime, runId });
};

export default logger;
