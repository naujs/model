function number(value) {
  return typeof value === 'number' || value instanceof Number;
};

number.toJSON = function() {
  return 'number';
};

number.isValid = function(value) {
  return value === 'number';
};

module.exports = number;
