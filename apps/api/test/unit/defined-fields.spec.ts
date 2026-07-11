import { definedFields } from '../../src/common/utils/defined-fields.js';

describe('definedFields', () => {
  it('omits undefined properties', () => {
    expect(
      definedFields({
        a: 'value',
        b: undefined,
        c: 0,
      }),
    ).toEqual({ a: 'value', c: 0 });
  });

  it('returns empty object when all values are undefined', () => {
    expect(definedFields({ a: undefined, b: undefined })).toEqual({});
  });
});
