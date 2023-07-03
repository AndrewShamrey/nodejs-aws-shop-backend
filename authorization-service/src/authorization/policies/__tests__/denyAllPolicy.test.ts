import { denyAllPolicy } from 'authorization/policies/denyAllPolicy';

describe('denyAllPolicy', () => {
  it('should return valid denyAll policy object', () => {
    expect(denyAllPolicy()).toMatchSnapshot();
  });
});
