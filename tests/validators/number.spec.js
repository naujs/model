var validate = require('../../build/validators').number
  , _ = require('lodash');

describe('number', () => {
  jasmine.commonValidatorTests(validate, 3, 1, {
    min: 2
  });

  it('should validate min and max', () => {
    var options = {
      min: 5,
      max: 8
    };

    var expectedValues = {
      6: true,
      4: false,
      9: false
    };

    _.each(expectedValues, (valid, value) => {
      var result = validate(parseInt(value), options);
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
      6: true,
      4: false,
      8: true
    };

    _.each(expectedValues, (valid, value) => {
      var result = validate(parseInt(value), options);
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
      6: true,
      5: true,
      9: false
    };

    _.each(expectedValues, (valid, value) => {
      var result = validate(parseInt(value), options);
      if (valid) {
        expect(result).toBeFalsy();
      } else {
        expect(result).not.toBeFalsy();
      }
    });
  });

  it('should reject if min and max are not provided', () => {
    var result = validate(5);
    expect(result).not.toBeFalsy();
  });

  it('should ignore if the input is undefined', () => {
    expect(void(0)).toBeFalsy();
  });
});
