var type = require('../../build/types').shape
  , string = require('../../build/types').string
  , number = require('../../build/types').number
  , _ = require('lodash');

describe('shape', () => {
  it('should detect value with valid shape', () => {
    var shape = type({
      name: string,
      age: number
    });

    var result = shape({
      name: 'test',
      age: 1
    });

    expect(result).toBe(true);
  });

  it('should reject if there is one invalid attribute', () => {
    var shape = type({
      name: string,
      age: number
    });

    var result = shape({
      name: 'test',
      age: '1'
    });

    expect(result).toBe(false);
  });

  it('should reject if having invalid option', () => {
    var invalidOptions = [
      undefined,
      null,
      {},
      []
    ];

    _.each(invalidOptions, (opt) => {
      var shape = type(opt);
      var result = shape({
        name: 'test',
        age: '1'
      });

      expect(result).toBe(false);
    });
  });
});
