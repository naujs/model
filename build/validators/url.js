'use strict';

var validator = require('validator'),
    _ = require('lodash');

module.exports = function (value) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var message = options.message || '%(value)s is not a valid url';

  if (!validator.isURL(value)) {
    return message;
  }

  return false;
};