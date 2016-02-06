'use strict';

var _ = require('lodash'),
    isArray = require('./array');

module.exports = function oneOfType() {
  var types = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  return function (value) {
    if (!types.length) return false;
    if (!isArray(value)) return false;

    var validValues = _.filter(value, function (v) {
      var results = _.chain(types).map(function (type) {
        return type(v);
      }).compact().value();

      return results.length > 0;
    });

    return validValues.length === value.length;
  };
};