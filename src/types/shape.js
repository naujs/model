var _ = require('lodash');

module.exports = function shape(shape) {
  return (value) => {
    if (!shape) return false;
    if (_.isEmpty(shape)) return false;

    for (let attribute in shape) {
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
