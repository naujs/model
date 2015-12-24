'use strict';

var _ = require('lodash');

module.exports = function any(value) {
  return _.isArray(value);
};