var validator = require('validator')
  , _ = require('lodash');

module.exports = (value, options = {}) => {
  var message = options.message || '%(value)s is not a valid url';

  if (!validator.isURL(value)) {
    return message;
  }

  return false;
};
