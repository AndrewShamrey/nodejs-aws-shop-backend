import * as yup from 'yup';
import BadRequestError from 'core/errors/BadRequestError';
import { Product, Stock } from 'interfaces/index';
import logger from 'utils/logger';

const requiredString = () => yup.string().required();
const requiredNumber = () => yup.number().required();

const ProductSchema = yup
  .object({
    id: requiredString(),
    title: requiredString(),
    price: requiredNumber(),
    description: yup.string(),
  })
  .noUnknown(true);

const StockSchema = yup
  .object({
    product_id: requiredString(),
    count: requiredNumber(),
  })
  .noUnknown(true);

const validateProductPayload = async (product: Product): Promise<void> => {
  try {
    await ProductSchema.validate(product, { abortEarly: false, strict: true });
  } catch (validationError) {
    const message = 'Product payload validation failed';
    const error = validationError.errors.join('. ');

    logger.error({ error }, message);

    throw new BadRequestError(error, { id: product.id });
  }
};

const validateStockPayload = async (stock: Stock): Promise<void> => {
  try {
    await StockSchema.validate(stock, { abortEarly: false, strict: true });
  } catch (validationError) {
    const message = 'Stock payload validation failed';
    const error = validationError.errors.join('. ');

    logger.error({ error }, message);

    throw new BadRequestError(error, { id: stock.product_id });
  }
};

const validatePayload = async (product: Product, stock: Stock): Promise<void> => {
  await validateProductPayload(product);
  await validateStockPayload(stock);
};

export { validateProductPayload, validateStockPayload, validatePayload };
