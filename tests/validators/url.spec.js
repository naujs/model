var validate = require('../../build/validators').url;

describe('url', () => {
  jasmine.commonValidatorTests(validate, 'http://google.com', 'invalidUrl');
});
