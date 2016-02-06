var type = require('../../build/types').boolean;

describe('boolean', () => {
  it('should detect boolean values', () => {
    expect(type(true)).toBe(true);
    expect(type(false)).toBe(true);
  });

  it('should reject invalid value', () => {
    expect(type(null)).toBe(false);
    expect(type(void(0))).toBe(false);
    expect(type(0)).toBe(false);
  });

  it('should return json compatible data', () => {
    expect(type.toJSON()).toEqual('boolean');
  });

  it('should detect valid string representation', () => {
    expect(type.isValid('boolean')).toBe(true);
    expect(type.isValid('string')).toBe(false);
  });
});
