"use strict";

module.exports = function instanceOf(Cls) {
  return function (value) {
    return value instanceof Cls;
  };
};