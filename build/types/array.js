'use strict';

var _ = require('lodash');

function array(value) {
  return _.isArray(value);
};

array.toJSON = function () {
  return [];
};

array.isValid = function (value) {
  return _.isArray(value) && _.isEmpty(value);
};

module.exports = array;