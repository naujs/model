var type = require('../../build/types').func;

function func() {

};

describe('func', () => {
  it('should detect function', () => {
    expect(type(func)).toBe(true);
  });

  it('should reject invalid value', () => {
    expect(type(null)).toBe(false);
    expect(type(void(0))).toBe(false);
    expect(type(0)).toBe(false);
    expect(type('123')).toBe(false);
  });
});
