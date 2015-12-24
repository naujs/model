var type = require('../../build/types').bool;

describe('bool', () => {
  it('should detect boolean values', () => {
    expect(type(true)).toBe(true);
    expect(type(false)).toBe(true);
  });

  it('should reject invalid value', () => {
    expect(type(null)).toBe(false);
    expect(type(void(0))).toBe(false);
    expect(type(0)).toBe(false);
  });
});
