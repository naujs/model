var type = require('../../build/types').object;

describe('object', () => {
  it('should detect object', () => {
    expect(type({a: 1})).toBe(true);
  });

  it('should reject invalid value', () => {
    expect(type('123')).toBe(false);
  });
});
