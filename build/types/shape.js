'use strict';

var _ = require('lodash');

module.exports = function shape(shape) {
  return function (value) {
    if (!shape) return false;
    if (_.isEmpty(shape)) return false;

    for (var attribute in shape) {
      var type = shape[attribute];
      if (typeof value[attribute] === 'undefined') {
        return false;
      }

      if (!type(value[attribute])) {
        return false;
      }
    }

    return true;
  };
};