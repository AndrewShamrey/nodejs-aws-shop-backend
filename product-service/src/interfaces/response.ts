import { Product, ProductsList } from 'interfaces/index';
import { ErrorResponse } from 'core/errors/interface';

type ResponseBodyProduct = Product;
type ResponseBodyProductsList = ProductsList;
type ResponseBodyError = ErrorResponse;

export { ResponseBodyProduct, ResponseBodyProductsList, ResponseBodyError };
