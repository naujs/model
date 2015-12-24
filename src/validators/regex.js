var validator = require('validator');

module.exports = (value, options = {}) => {
  var message = options.message || '%(value)s is not valid';

  if (!options.pattern) {
    return message;
  }

  if (!validator.matches(value, options.pattern)) {
    return message;
  }

  return false;
};
