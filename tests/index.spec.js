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

  afterEach(() => {
    Dummy.clearHooks();
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

    it('should support custom setter', () => {
      Dummy.setter('name', (value) => {
        return value.toUpperCase();
      });

      dummy.name = 'test';
      expect(dummy.name).toEqual('TEST');
      expect(dummy._attributes.name).toEqual('TEST');
    });

    it('should support custom getter', () => {
      Dummy.getter('name', (value) => {
        return 'getter-' + value.toUpperCase();
      });

      dummy.name = 'test';
      expect(dummy.name).toEqual('getter-TEST');
      expect(dummy._attributes.name).toEqual('test');
    });

    afterEach(() => {
      Dummy.setter('name', null);
      Dummy.getter('name', null);
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
    var onBeforeValidate, onAfterValidate;

    beforeEach(() => {
      dummy.name = 'Tan Nguyen';
      spyOn(console, 'warn').and.callThrough();

      onBeforeValidate = jasmine.createSpy('onBeforeValidate');
      onAfterValidate = jasmine.createSpy('onAfterValidate');

      Dummy.watch('beforeValidate', onBeforeValidate);
      Dummy.watch('afterValidate', onAfterValidate);
    });

    it('should validate the attributes asynchronously', () => {
      return dummy.validate().then((result) => {
        expect(result).toBe(true);
      });
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

    it('should trigger beforeValidate hook', () => {
      let options = {test: 1};
      return dummy.validate(options).then(() => {
        expect(onBeforeValidate.calls.count()).toBe(1);
        expect(onBeforeValidate).toHaveBeenCalledWith(dummy, options);
      });
    });

    it('should trigger afterValidate hook', () => {
      let options = {test: 1};
      return dummy.validate(options).then(() => {
        expect(onAfterValidate.calls.count()).toBe(1);
        expect(onAfterValidate).toHaveBeenCalledWith(true, dummy, options);
      });
    });
  });
});
