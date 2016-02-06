/*eslint func-style:0*/

'use strict';

var _ = require('lodash'),
    isArray = require('./array');

function arrayOf(type) {
  var check = function check(value) {
    if (!type) {
      return false;
    }

    if (!isArray(value)) return false;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = value[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var v = _step.value;

        if (!type(v)) {
          return false;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return true;
  };

  check.toJSON = function () {
    return [type.toJSON()];
  };

  return check;
};

arrayOf.isValid = function (value) {
  return _.isArray(value) && value.length == 1;
};

module.exports = arrayOf;