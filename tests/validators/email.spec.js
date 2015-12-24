var validate = require('../../build/validators').email;

describe('email', () => {
  jasmine.commonValidatorTests(validate, 'valid@email.com', 'invalidEmail');
});
