import { Product, ProductsList } from 'interfaces/index';

const product: Product = {
  productId: '48b21827-7476-44ab-ba71-0c49401f8495',
  title: 'Product title',
  price: 300,
  description: 'Very long text',
  creationDate: '2023-05-16T14:06:19.172Z',
};

const productsList: ProductsList = [product];

export { product, productsList };
