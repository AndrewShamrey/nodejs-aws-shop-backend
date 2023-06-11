import { Product, Stock } from 'interfaces/index';

interface FullProduct extends Product {
  count: Stock['count'];
}

type FullProductsList = FullProduct[];

export { FullProduct, FullProductsList };
