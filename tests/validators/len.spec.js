var validate = require('../../build/validators').len
  , _ = require('lodash');

describe('len', () => {
  jasmine.commonValidatorTests(validate, '123', '1', {
    min: 2
  });

  it('should validate min and max', () => {
    var options = {
      min: 5,
      max: 8
    };

    var expectedValues = {
      '123456': true,
      '1234': false,
      '123456789': false
    };

    _.each(expectedValues, (valid, value) => {
      var result = validate(value, options);
      if (valid) {
        expect(result).toBeFalsy();
      } else {
        expect(result).not.toBeFalsy();
      }
    });
  });

  it('should validate min', () => {
    var options = {
      min: 5
    };

    var expectedValues = {
      '123456': true,
      '1234': false,
      '12345678': true
    };

    _.each(expectedValues, (valid, value) => {
      var result = validate(value, options);
      if (valid) {
        expect(result).toBeFalsy();
      } else {
        expect(result).not.toBeFalsy();
      }
    });
  });

  it('should validate max', () => {
    var options = {
      max: 8
    };

    var expectedValues = {
      '123456': true,
      '12345': true,
      '123456789': false
    };

    _.each(expectedValues, (valid, value) => {
      var result = validate(value, options);
      if (valid) {
        expect(result).toBeFalsy();
      } else {
        expect(result).not.toBeFalsy();
      }
    });
  });

  it('should reject if min and max are not provided', function() {
    var result = validate('12345');
    expect(result).not.toBeFalsy();
  });

  it('should ignore if the input is undefined', () => {
    expect(void(0)).toBeFalsy();
  });
});
