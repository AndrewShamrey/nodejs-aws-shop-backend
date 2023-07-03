process.env.IS_TEST = 'true';

jest.mock('utils/logger');
jest.setTimeout(40000);

export {};
