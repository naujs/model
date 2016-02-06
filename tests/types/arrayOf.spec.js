var type = require('../../build/types').arrayOf
  , string = require('../../build/types').string;

describe('arrayOf', () => {
  it('should detect array of a type', () => {
    var arrayOf = type(string);
    expect(arrayOf(['1', '2', '3'])).toBe(true);
  });

  it('should reject if the array has one invalid type', () => {
    var arrayOf = type(string);
    expect(arrayOf(['1', 2, '3'])).toBe(false);
  });

  it('should reject if no type provided', () => {
    var arrayOf = type();
    expect(arrayOf(['1', '2', '3'])).toBe(false);
  });

  it('should return json compatible data', () => {
    var arrayOf = type(string);
    expect(arrayOf.toJSON()).toEqual(['string']);
  });

  it('should detect valid string representation', () => {
    expect(type.isValid(['string'])).toBe(true);
    expect(type.isValid([])).toBe(false);
    expect(type.isValid('string')).toBe(false);
  });
});
