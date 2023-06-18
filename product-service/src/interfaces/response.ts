import { FullProduct, FullProductsList } from 'interfaces/index';
import { ErrorResponse } from 'core/errors/interface';

type ResponseBodyProduct = FullProduct;
type ResponseBodyProductsList = FullProductsList;
type ResponseBodyError = ErrorResponse;

export { ResponseBodyProduct, ResponseBodyProductsList, ResponseBodyError };
