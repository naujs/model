/*eslint func-style:0*/

'use strict';

var _ = require('lodash')
  , isArray = require('./array');

function arrayOf(type) {
  var check = function(value) {
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

  check.toJSON = function() {
    return [type.toJSON()];
  };

  return check;
};

arrayOf.isValid = function(value) {
  return _.isArray(value) && value.length == 1;
};

module.exports = arrayOf;
