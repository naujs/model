var _ = require('lodash');

module.exports = function object(value) {
  return _.isObject(value);
};
