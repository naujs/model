var _ = require('lodash');

function object(value) {
  return _.isObject(value);
};

object.toJSON = function() {
  return 'object';
};

object.isValid = function(value) {
  return value === 'object';
};

module.exports = object;
