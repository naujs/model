'use strict';

var Model = require('..');

class Dummy extends Model {

}

Dummy.properties = {
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

describe('Model', () => {
  var dummy;

  beforeEach(() => {
    dummy = new Dummy();
  });

  describe('.getModelName', () => {
    it('should return class name by default', () => {
      expect(Dummy.getModelName()).toEqual('Dummy');
    });

    it('should return custom set name if available', () => {
      Dummy.modelName = 'test';
      expect(Dummy.getModelName()).toEqual('test');
    });

    afterEach(() => {
      delete Dummy.modelName;
    });
  });

  describe('.getPluralName', () => {
    it('should return plural name using model name', () => {
      expect(Dummy.getPluralName()).toEqual('Dummies');
    });

    it('should return custom set name if available', () => {
      Dummy.pluralName = 'tests';
      expect(Dummy.getPluralName()).toEqual('tests');
    });

    afterEach(() => {
      delete Dummy.pluralName;
    });
  });

  describe('setters/getters', () => {
    it('should store attributes in _attributes', () => {
      dummy.name = 'test';
      expect(dummy._attributes.name).toEqual('test');
    });

    it('should get attributes from _attributes', () => {
      dummy.name = 'test';
      expect(dummy.name).toEqual('test');
    });
  });

  describe('#setAttributes', () => {
    it('should only set attributes that are defined', () => {
      dummy.setAttributes({
        name: 'Tan Nguyen',
        weirdStuff: 'should not be set'
      });

      expect(dummy.name).toEqual('Tan Nguyen');
      expect(dummy.weirdStuff).not.toBeDefined();
    });
  });

  describe('#getAttributes', () => {
    it('should only set attributes that are defined', () => {
      dummy.setAttributes({
        name: 'Tan Nguyen'
      });

      dummy.weirdStuff = 'really weird';

      expect(dummy.name).toEqual('Tan Nguyen');
      expect(dummy.getAttributes()).toEqual({
        name: 'Tan Nguyen'
      });
    });
  });

  describe('#validate', () => {
    beforeEach(() => {
      dummy.name = 'Tan Nguyen';
      spyOn(console, 'warn').and.callThrough();
    });

    it('should validate the attributes asynchronously', () => {
      return dummy.validate().then((result) => {
        expect(result).toBe(true);
      });
    });

    it('should validate the attributes synchronously', () => {
      expect(dummy.validate({
        sync: true
      })).toBe(true);
    });

    it('should store errors', () => {
      dummy = new Dummy({
        name: 'Ta1',
        age: 200
      });

      return dummy.validate().then((result) => {
        expect(result).toBe(false);
        expect(dummy.getErrors()).toEqual({
          name: [
            'name must be greater than 4 characters',
            'Ta1 is not valid'
          ],
          age: ['age must be less than 100 and greater than 0']
        });
      });
    });

    it('should validate type and print warning', () => {
      dummy = new Dummy({
        name: 'Tan Nguyen',
        address: 1
      });

      return dummy.validate().then((result) => {
        expect(result).toBe(true);
        expect(console.warn).toHaveBeenCalledWith('address violates string type validation with value 1 of type number');
      });
    });

    it('should trigger invalid event in asynchronous validation', () => {
      dummy = new Dummy({
        name: 'Tan'
      });

      var spy = jasmine.createSpy();

      dummy.on('invalid', spy);

      return dummy.validate().then((result) => {
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalledWith(dummy.getErrors());
      });
    });

    it('should trigger invalid event in synchronous validation', () => {
      dummy = new Dummy({
        name: 'Tan'
      });

      var spy = jasmine.createSpy();

      dummy.on('invalid', spy);

      dummy.validate({
        sync: true
      });

      expect(spy).toHaveBeenCalledWith(dummy.getErrors());
    });
  });

  describe('#onBeforeValidate', () => {
    beforeEach(() => {
      dummy.name = 'Tan Nguyen';

      spyOn(dummy, 'onBeforeValidate').and.callFake(() => {
        return false;
      });
    });

    it('should cancel the validation process by returning false', (done) => {
      dummy.validate().then((result) => {
        expect(result).toBe(false);
      }).then(done, fail);
    });

    it('should work in sync mode', () => {
      var result = dummy.validate({
        sync: true
      });

      expect(result).toBe(false);
    });
  });

  describe('#onAfterValidate', () => {
    beforeEach(() => {
      dummy.name = 'Tan Nguyen';

      spyOn(dummy, 'onAfterValidate').and.callFake(() => {
        return false;
      });
    });

    it('should be called after the validation process', () => {
      return dummy.validate().then((result) => {
        expect(result).toBe(true);
        expect(dummy.onAfterValidate).toHaveBeenCalled();
      });
    });

    it('should work in sync mode', () => {
      dummy.validate({
        sync: true
      });

      expect(dummy.onAfterValidate).toHaveBeenCalled();
    });

    it('should be called only if the validation succeeds', () => {
      dummy.age = 200;

      dummy.validate({
        sync: true
      });

      expect(dummy.onAfterValidate).not.toHaveBeenCalled();
    });
  });
});
