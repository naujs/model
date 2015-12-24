var type = require('../../build/types').number;

describe('number', () => {
  it('should detect number value', () =>  {
    expect(type(1)).toBe(true);
  });

  it('should detect Number instance', () => {
    expect(type(new Number(1))).toBe(true);
  });

  it('should reject invalid value', () => {
    expect(type('123')).toBe(false);
  });
});
