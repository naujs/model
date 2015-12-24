var _ = require('lodash');

module.exports = (value, options = {}) => {
  if (_.isBoolean(options)) {
    options = {};
  }

  var message = options.message || '%(attribute)s is required';

  if (value === void(0)) {
    return message;
  }

  return false;
};
