'use strict';

var _ = require('lodash');

function boolean(value) {
  return _.isBoolean(value);
};

boolean.toJSON = function () {
  return 'boolean';
};

boolean.isValid = function (value) {
  return value === 'boolean';
};

module.exports = boolean;