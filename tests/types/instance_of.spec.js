var type = require('../../build/types').instanceOf;

function Test() {}
function AnotherClass() {}

describe('instanceOf', () => {
  it('should detect valid instance', () => {
    expect(type(Test)(new Test())).toBe(true);
  });

  it('should reject invalid instance', () => {
    expect(type(AnotherClass)(new Test())).toBe(false);
  });
});
