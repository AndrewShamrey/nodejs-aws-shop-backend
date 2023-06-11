import * as fs from 'fs';
import * as path from 'path';
import getKnexInstance from 'product/db/utils/getKnexInstance';
import { script } from 'db/script';

const fillTables = async () => {
  const knex = getKnexInstance();

  try {
    const sql = fs.readFileSync(path.resolve(process.cwd(), 'dump', 'dump-shop.sql')).toString();
    await knex.raw(sql);
  } catch (error) {
    console.log(error);
  }
};

script(fillTables);
