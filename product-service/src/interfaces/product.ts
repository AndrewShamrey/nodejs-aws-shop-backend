import { Text, UUID } from 'interfaces/index';

interface Product {
  id: UUID;
  /** @example Product title */
  title: string;
  /** @example 300 */
  price: number;
  description?: Text;
  /** @example https://i.imgur.com/FgTsHwF.jpg */
  image?: string;
}

type ProductsList = Product[];

export { Product, ProductsList };
