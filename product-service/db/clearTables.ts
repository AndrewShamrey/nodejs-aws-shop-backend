import { Knex } from 'knex';
import getKnexInstance from 'product/db/utils/getKnexInstance';
import { script } from 'db/script';

const clearTables = async (knex: Knex, tables: string[]) => {
  await Promise.allSettled(
    tables.map((db) =>
      knex(db)
        .delete()
        .returning('*')
        .then((v) => v),
    ),
  );
};

script(async () => {
  const { PG_PRODUCTS_TABLE, PG_STOCKS_TABLE } = process.env;
  const knex = getKnexInstance();

  const tablesToClear = [PG_PRODUCTS_TABLE, PG_STOCKS_TABLE];
  await clearTables(knex, tablesToClear);
});
