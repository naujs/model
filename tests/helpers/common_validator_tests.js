jasmine.commonValidatorTests = (validate, validInput, invalidInput, options) => {
  options = options || {};

  it('should return false/null if the input is valid', () => {
    var result = validate(validInput, options);

    expect(result).toBeDefined();
    expect(result).toBeFalsy();
  });

  it('should return string if the input is invalid', () => {
    var result = validate(invalidInput, options);

    expect(typeof result).toEqual('string');
  });

  it('should support custom error message', () => {
    options.message = 'test';
    var result = validate(invalidInput, options);

    expect(result).toEqual('test');
  });
};
