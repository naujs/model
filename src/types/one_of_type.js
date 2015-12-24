var _ = require('lodash')
  , isArray = require('./array');

module.exports = function oneOfType(types = []) {
  return (value) => {
    if (!types.length) return false;
    if (!isArray(value)) return false;

    var validValues = _.filter(value, (v) => {
      var results = _.chain(types).map((type) => {
        return type(v);
      }).compact().value();

      return results.length > 0;
    });

    return validValues.length === value.length;
  };
};
