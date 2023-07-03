const allowPolicy = jest.fn();
const denyAllPolicy = jest.fn();
jest.mock('authorization/policies/allowPolicy', () => ({ allowPolicy }));
jest.mock('authorization/policies/denyAllPolicy', () => ({ denyAllPolicy }));

import { basicAuthorizer } from 'authorization/index';

describe('basicAuthorizer', () => {
  const login = 'testUser';
  const password = 'testPassword';
  process.env[login] = password;

  it('should return allow policy if authorization is successful', () => {
    basicAuthorizer('Basic ' + new Buffer(`${login}:${password}`).toString('base64'));
    expect(allowPolicy).toBeCalled();
  });

  it('should return deny policy if authorization fails due to password mismatch', () => {
    basicAuthorizer('Basic ' + new Buffer(`${login}:${password}-fail`).toString('base64'));
    expect(denyAllPolicy).toBeCalled();
  });

  it('should return deny policy if login is not found in process.env', () => {
    basicAuthorizer('Basic ' + new Buffer(`fail-${login}:${password}`).toString('base64'));
    expect(denyAllPolicy).toBeCalled();
  });
});
