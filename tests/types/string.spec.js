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

  it('should return json compatible data', () => {
    expect(type.toJSON()).toEqual('string');
  });

  it('should detect valid string representation', () => {
    expect(type.isValid('string')).toBe(true);
    expect(type.isValid('number')).toBe(false);
  });
});
