var validate = require('../../build/validators').regex;

describe('regex', () => {
  jasmine.commonValidatorTests(validate, 'abc', '123', {
    pattern: /[a-z]{3}/
  });

  it('should reject if no regex is provided', () => {
    var result = validate('abc');
    expect(typeof result).toEqual('string');
  });
});
