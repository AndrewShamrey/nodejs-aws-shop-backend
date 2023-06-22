import getKnexInstance from 'product/db/utils/getKnexInstance';

const mockKnexInstance = jest.spyOn(require('knex'), 'default');

describe('getKnexInstance', () => {
  it('should return a Knex instance with the correct configuration', () => {
    const knexConnectionConfig = {
      host: 'localhost',
      port: 5432,
      user: 'test_user',
      password: 'test_password',
      database: 'test_db',
    };

    process.env.IS_LOCAL = 'true';
    process.env.PG_HOST = knexConnectionConfig.host;
    process.env.PG_PORT = String(knexConnectionConfig.port);
    process.env.PG_USERNAME = knexConnectionConfig.user;
    process.env.PG_PASSWORD = knexConnectionConfig.password;
    process.env.PG_DATABASE = knexConnectionConfig.database;

    getKnexInstance();

    expect(mockKnexInstance).toBeCalledWith({
      debug: true,
      client: 'pg',
      connection: knexConnectionConfig,
      pool: {
        min: 0,
        max: 10,
        acquireTimeoutMillis: 26000,
        createTimeoutMillis: 1500,
        createRetryIntervalMillis: 500,
        propagateCreateError: false,
      },
    });
  });
});
