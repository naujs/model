module.exports = function instanceOf(Cls) {
  return (value) => {
    return value instanceof Cls;
  };
};
