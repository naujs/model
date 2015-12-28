'use strict';

var Model = require('../build/model');

class TestClass extends Model {
  attributes() {
    return {
      'name': {
        type: Model.Types.string,
        rules: {
          required: true,
          len: {
            min: 4
          },
          regex: {
            pattern: /^Tan\sNguyen$/
          }
        }
      },
      'age': {
        type: Model.Types.number,
        rules: {
          number: {
            min: 0,
            max: 100
          }
        }
      },
      'address': {
        type: Model.Types.string
      }
    };
  }
}

describe('Model', () => {
  describe('#onBeforeValidate', () => {
    var test;

    beforeEach(() => {
      test = new TestClass({
        name: 'Tan Nguyen'
      });

      spyOn(test, 'onBeforeValidate').and.callFake(() => {
        return false;
      });
    });

    it('should cancel the validation process by returning false', (done) => {
      test.validate().then((result) => {
        expect(result).toBe(false);
      }).then(done, fail);
    });

    it('should work in sync mode', () => {
      var result = test.validate({
        sync: true
      });

      expect(result).toBe(false);
    });
  });

  describe('#validate', () => {
    beforeEach(() => {
      spyOn(console, 'warn').and.callThrough();
    });

    it('should validate the attributes asynchronously', (done) => {
      var test = new TestClass({
        name: 'Tan Nguyen'
      });

      test.validate().then((result) => {
        expect(result).toBe(true);
      }).then(done, fail);
    });

    it('should validate the attributes synchronously', () => {
      var test = new TestClass({
        name: 'Tan Nguyen'
      });

      expect(test.validate({
        sync: true
      })).toBe(true);
    });

    it('should store errors', (done) => {
      var test = new TestClass({
        name: 'Ta1',
        age: 200
      });

      test.validate().then((result) => {
        expect(result).toBe(false);
        expect(test.getErrors()).toEqual({
          name: [
            'name must be greater than 4 characters',
            'Ta1 is not valid'
          ],
          age: ['age must be less than 100 and greater than 0']
        });
      }).then(done, fail);
    });

    it('should validate type and print warning', (done) => {
      var test = new TestClass({
        name: 'Tan Nguyen',
        address: 1
      });

      test.validate().then((result) => {
        expect(result).toBe(true);
        expect(console.warn).toHaveBeenCalledWith('address violates string type validation with value 1 of type number');
      }).then(done, fail);
    });

    it('should trigger invalid event in asynchronous validation', (done) => {
      var test = new TestClass({
        name: 'Tan'
      });

      var spy = jasmine.createSpy();

      test.on('invalid', spy);

      test.validate().then((result) => {
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalledWith(test.getErrors());
      }).then(done, fail);
    });

    it('should trigger invalid event in synchronous validation', () => {
      var test = new TestClass({
        name: 'Tan'
      });

      var spy = jasmine.createSpy();

      test.on('invalid', spy);

      test.validate({
        sync: true
      });

      expect(spy).toHaveBeenCalledWith(test.getErrors());
    });
  });

  describe('#onAfterValidate', () => {
    var test;

    beforeEach(() => {
      test = new TestClass({
        name: 'Tan Nguyen'
      });

      spyOn(test, 'onAfterValidate').and.callFake(() => {
        return false;
      });
    });

    it('should be called after the validation process', (done) => {
      test.validate().then((result) => {
        expect(result).toBe(true);
        expect(test.onAfterValidate).toHaveBeenCalled();
      }).then(done, fail);
    });

    it('should work in sync mode', () => {
      test.validate({
        sync: true
      });

      expect(test.onAfterValidate).toHaveBeenCalled();
    });

    it('should be called only if the validation succeeds', () => {
      test.age = 200;

      test.validate({
        sync: true
      });

      expect(test.onAfterValidate).not.toHaveBeenCalled();
    });
  });

});
