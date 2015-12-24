var validator = require('validator');

module.exports = (value, options = {}) => {
  var message = options.message || '%(value)s is not a valid email';

  if (!validator.isEmail(value)) {
    return message;
  }

  return false;
};
