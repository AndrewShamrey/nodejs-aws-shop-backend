import { StatusCodes } from 'http-status-codes';
import { HEADERS } from 'utils/constants';
import Response from 'core/responses/Response';

describe('Response', () => {
  const mockBody = { message: 'Hello, world!' };
  const mockOptions = {
    headers: {
      [HEADERS.HEADER_CONTENT_TYPE]: 'application/json',
    },
  };

  describe('constructor', () => {
    it('should create response object with default values', () => {
      const response = new Response(mockBody);

      expect(response.body).toEqual(mockBody);
      expect(response.statusCode).toEqual(StatusCodes.OK);
    });

    it('should create response object with provided values', () => {
      const response = new Response(mockBody, StatusCodes.CREATED, mockOptions);

      expect(response.body).toEqual(mockBody);
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.options).toEqual(mockOptions);
    });
  });

  describe('serialize', () => {
    it('should serialize response object', () => {
      const response = new Response(mockBody, StatusCodes.OK, mockOptions);
      const serializedResponse = response.serialize();

      expect(serializedResponse.body).toEqual(JSON.stringify(mockBody));
      expect(serializedResponse.statusCode).toEqual(StatusCodes.OK);
      expect(serializedResponse.headers).toEqual(mockOptions.headers);
    });

    it('should serialize the response object without options', () => {
      const response = new Response(mockBody, StatusCodes.OK);
      const serializedResponse = response.serialize();

      expect(serializedResponse.headers).toBeUndefined();
    });
  });

  describe('from', () => {
    it('should return the same response object if already an instance of Response', () => {
      const existingResponse = new Response(mockBody, StatusCodes.OK, mockOptions);
      const result = Response.from(existingResponse);

      expect(result).toEqual(existingResponse);
    });

    it('should create a new response object if the input is not an instance of Response', () => {
      const result = Response.from(mockBody);

      expect(result).toBeInstanceOf(Response);
      expect(result.body).toEqual(mockBody);
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.options).toBeUndefined();
    });
  });
});
