import { allowPolicy } from 'authorization/policies/allowPolicy';

describe('allowPolicy', () => {
  it('should return valid allow policy object', () => {
    expect(allowPolicy()).toMatchSnapshot();
    expect(allowPolicy('test-id')).toMatchSnapshot();
  });
});
