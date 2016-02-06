/*eslint func-style:0*/

var _ = require('lodash');

function shape(shape) {
  var check = function(value) {
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

  check.toJSON = function() {
    return _.chain(shape).toPairs().map((pair) => {
      return [pair[0], pair[1].toJSON()];
    }).fromPairs().value();
  };

  return check;
};

shape.isValid = function(value) {
  return _.isObject(value) && !_.isArray(value);
};

module.exports = shape;
