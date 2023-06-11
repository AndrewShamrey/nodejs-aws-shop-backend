import { UUID } from 'interfaces/index';

interface Stock {
  product_id: UUID;
  /** @example 20 */
  count: number;
}

export { Stock };
