'use strict';

var _ = require('lodash');

module.exports = function (value) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  if (_.isBoolean(options)) {
    options = {};
  }

  var message = options.message || '%(property)s is required';

  if (value === void 0) {
    return message;
  }

  return false;
};