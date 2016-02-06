'use strict';

module.exports = function (value) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var message = options.message || 'Invalid string';

  if (value === void 0) {
    return false;
  }

  if (typeof value !== 'string') {
    return message;
  }

  var min = options.min,
      max = options.max;

  if (typeof min === 'undefined' && typeof max === 'undefined') {
    return message;
  }

  var len = value.length;

  if (min !== void 0 && max !== void 0) {
    if (len < min || len > max) {
      return options.message ? options.message : '%(property)s must be less than %(max)d and greater than %(min)d characters';
    }
  } else if (min !== void 0) {
    if (len < min) {
      return options.message ? options.message : '%(property)s must be greater than %(min)d characters';
    }
  } else if (max !== void 0) {
    if (len > max) {
      return options.message ? options.message : '%(property)s must be less than %(max)d characters';
    }
  }

  return false;
};