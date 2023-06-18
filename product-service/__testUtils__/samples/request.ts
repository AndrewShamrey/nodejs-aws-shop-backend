import { product } from '__testUtils__/samples/product';
import { stock } from '__testUtils__/samples/stock';
import { RequestBodyProductCreate } from 'interfaces/index';

const requestBodyProductCreate: RequestBodyProductCreate = {
  title: product.title,
  price: product.price,
  count: stock.count,
  description: product.description,
};

export { requestBodyProductCreate };
