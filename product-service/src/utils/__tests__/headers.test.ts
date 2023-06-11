import { getValueFromHeaders, toLowerKeys } from 'utils/headers';

describe('toLowerKeys', () => {
  it('should convert object keys to lowercase', () => {
    const input = { Key1: 'Value1', Key2: 'Value2' };
    const expectedOutput = { key1: 'Value1', key2: 'Value2' };

    const result = toLowerKeys(input);

    expect(result).toEqual(expectedOutput);
  });

  it('should not modify the original object', () => {
    const input = { Key1: 'Value1', Key2: 'Value2' };

    toLowerKeys(input);

    expect(input).toEqual({ Key1: 'Value1', Key2: 'Value2' });
  });
});

describe('getValueFromHeaders', () => {
  it('should return the header value for a given key (case-insensitive)', () => {
    const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer token' };
    const getValue = getValueFromHeaders(headers);

    expect(getValue('content-type')).toEqual(headers['Content-Type']);
    expect(getValue('Authorization')).toEqual(headers.Authorization);
  });

  it('should return undefined if the header key does not exist', () => {
    const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer token' };
    const getValue = getValueFromHeaders(headers);

    expect(getValue('X-Custom-Header')).toBeUndefined();
  });

  it('should handle undefined headers', () => {
    const getValue = getValueFromHeaders(undefined);

    expect(getValue('Content-Type')).toBeUndefined();
  });
});
