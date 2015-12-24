var type = require('../../build/types').string;

describe('string', () => {
  it('should detect string value', () => {
    expect(type('string')).toBe(true);
  });

  it('should detect string instance', () => {
    expect(type(new String('string'))).toBe(true);
  });

  it('should reject invalid value', () => {
    expect(type(123)).toBe(false);
  });
});
