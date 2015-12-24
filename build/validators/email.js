'use strict';

var validator = require('validator');

module.exports = function (value) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var message = options.message || '%(value)s is not a valid email';

  if (!validator.isEmail(value)) {
    return message;
  }

  return false;
};