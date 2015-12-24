var type = require('../../build/types').oneOfType
  , string = require('../../build/types').string
  , number = require('../../build/types').number;

describe('oneOfType', () => {
  it('should detect one of types', () => {
    var oneOfType = type([string, number]);
    expect(oneOfType(['1', 2, '3'])).toBe(true);
  });

  it('should reject if there is one invalid type', () => {
    var oneOfType = type([string, number]);
    expect(oneOfType([{}, 2, '3'])).toBe(false);
  });

  it('should reject if the value is not an array', () => {
    var oneOfType = type([string, number]);
    expect(oneOfType(1)).toBe(false);
  });

  it('should reject if types is not provided', () => {
    var oneOfType = type();
    expect(oneOfType(1)).toBe(false);
  });
});
