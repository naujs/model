'use strict';

var _ = require('lodash');

module.exports = function bool(value) {
  return _.isBoolean(value);
};