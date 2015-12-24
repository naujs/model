'use strict';

var _ = require('lodash');

module.exports = function func(value) {
  return _.isFunction(value);
};