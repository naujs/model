'use strict';

function string(value) {
  return typeof value === 'string' || value instanceof String;
};

string.toJSON = function () {
  return 'string';
};

string.isValid = function (value) {
  return value === 'string';
};

module.exports = string;