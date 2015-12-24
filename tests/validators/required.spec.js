var validate = require('../../build/validators').required;

describe('required', () => {
  jasmine.commonValidatorTests(validate, 'ok', void(0));

  it('should support boolean option', () => {
    expect(validate('ok', true)).toBe(false);
  });
});
