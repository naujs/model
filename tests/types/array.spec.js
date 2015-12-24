var type = require('../../build/types').array;

describe('array', () => {
  it('should detect array', () => {
    expect(type([1, 2, 3])).toBe(true);
    expect(type(new Array(1, 2, 3))).toBe(true);
  });

  it('should reject invalid value', () => {
    expect(type('123')).toBe(false);
    expect(type({a: 1})).toBe(false);
  });
});
