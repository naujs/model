var type = require('../../build/types').object;

describe('object', () => {
  it('should detect object', () => {
    expect(type({a: 1})).toBe(true);
  });

  it('should reject invalid value', () => {
    expect(type('123')).toBe(false);
  });

  it('should return json compatible data', () => {
    expect(type.toJSON()).toEqual('object');
  });

  it('should detect valid string representation', () => {
    expect(type.isValid('object')).toBe(true);
    expect(type.isValid('string')).toBe(false);
  });
});
