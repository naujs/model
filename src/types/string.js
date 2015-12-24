module.exports = function string(value) {
  return typeof value === 'string' || value instanceof String;
};
