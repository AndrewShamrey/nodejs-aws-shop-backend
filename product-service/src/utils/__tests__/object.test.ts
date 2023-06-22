import { clean } from 'utils/object';

describe('clean', () => {
  it('removes all properties with value of undefined', async () => {
    const skeleton = {
      boolean: 'boolean',
      number: 'number',
      string: 'string',
      object: {},
      array: ['a', 'b'],
      function: () => { /**/ },
      null: null,
    };

    const object = {
      ...skeleton,
      undefined: undefined,
      secondLayer: {
        undefined: undefined,
        thirdLayer: {
          undefined: undefined,
        },
      },
    };

    const result = clean(object);

    expect(result).toEqual({ ...skeleton, secondLayer: { thirdLayer: {} } });
  });
});
