import { Product, Stock } from 'interfaces/index';

type RequestBodyProductCreate = {
  title: Product['title'];
  price: Product['price'];
  count: Stock['count'];
  description?: Product['description'];
  image?: Product['image'];
};

export { RequestBodyProductCreate };
