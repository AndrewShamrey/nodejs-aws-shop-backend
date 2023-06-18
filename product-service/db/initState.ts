import getKnexInstance from 'product/db/utils/getKnexInstance';
import { script } from 'db/script';

const initDBStateUp = async (): Promise<void> => {
  const { PG_PRODUCTS_TABLE, PG_STOCKS_TABLE } = process.env;
  const knex = getKnexInstance();

  const PRODUCTS_TABLE_EXISTS = await knex.schema.hasTable(PG_PRODUCTS_TABLE);
  const STOCKS_TABLE_EXISTS = await knex.schema.hasTable(PG_STOCKS_TABLE);

  if (!PRODUCTS_TABLE_EXISTS) {
    await knex.schema.createTable(PG_PRODUCTS_TABLE, (table) => {
      table.uuid('id').primary().unique().notNullable();
      table.string('title').notNullable();
      table.text('description');
      table.integer('price');
    });
  }

  if (!STOCKS_TABLE_EXISTS) {
    await knex.schema.createTable(PG_STOCKS_TABLE, (table) => {
      table
        .uuid('product_id')
        .notNullable()
        .references('id')
        .inTable(PG_PRODUCTS_TABLE)
        .onDelete('CASCADE');
      table.integer('count');
    });
  }
};

script(initDBStateUp);
