import { product } from '__testUtils__/samples/product';
import { stock } from '__testUtils__/samples/stock';
import { FullProduct, FullProductsList } from 'interfaces/index';

const fullProduct: FullProduct = {
  ...product,
  count: stock.count,
};

const fullProductsList: FullProductsList = [fullProduct];

export { fullProduct, fullProductsList };
