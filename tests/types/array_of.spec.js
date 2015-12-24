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
});
