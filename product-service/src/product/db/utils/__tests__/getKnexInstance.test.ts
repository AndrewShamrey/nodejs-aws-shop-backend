import knexInstance, { Knex } from 'knex';
import getKnexInstance, { destroyAll } from 'product/db/utils/getKnexInstance';

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

    const instance = getKnexInstance();

    expect(knexInstance).toBeCalledWith({
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

    expect(instance).toBeInstanceOf(Knex);
  });
});

describe('destroyAll', () => {
  it('should call destroy on all knex instances', async () => {
    const mockInstances = [{ destroy: jest.fn() }, { destroy: jest.fn() }, { destroy: jest.fn() }];

    await destroyAll();

    mockInstances.forEach((instance) => {
      expect(instance.destroy).toHaveBeenCalled();
    });
  });
});
