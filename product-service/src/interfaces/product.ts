import { DateISO, Text, UUID } from 'interfaces/index';

interface Product {
  productId: UUID;
  /** @example Product title */
  title: string;
  /** @example 300 */
  price: number;
  creationDate: DateISO;
  description?: Text;
}

type ProductsList = Product[];

export { Product, ProductsList };
