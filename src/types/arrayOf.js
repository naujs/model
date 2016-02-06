'use strict';

var _ = require('lodash')
  , isArray = require('./array');

module.exports = function arrayOf(type) {
  return (value) => {
    if (!type) {
      return false;
    }

    if (!isArray(value)) return false;

    for (let v of value) {
      if (!type(v)) {
        return false;
      }
    }

    return true;
  };
};
