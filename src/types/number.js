module.exports = function number(value) {
  return typeof value === 'number' || value instanceof Number;
};
