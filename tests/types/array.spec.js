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

  it('should return json compatible data', () => {
    expect(type.toJSON()).toEqual([]);
  });

  it('should detect valid string representation', () => {
    expect(type.isValid([])).toBe(true);
    expect(type.isValid('string')).toBe(false);
  });
});
