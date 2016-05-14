'use strict';

var Model = require('..');

class Dummy extends Model {

}

Dummy.properties = function() {
  return {
    'name': {
      type: 'string',
      required: true,
      len: {
        min: 4
      },
      regex: /^Tan\sNguyen$/
    },
    'age': {
      type: 'number',
      min: 0,
      max: 100
    },
    'address': {
      type: 'string'
    }
  };
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
    it('should store attributes in _properties', () => {
      dummy.name = 'test';
      expect(dummy._properties.name.getValue()).toEqual('test');
    });

    it('should get attributes from _properties', () => {
      dummy.name = 'test';
      expect(dummy.name).toEqual('test');
    });

    it('should support custom setter', () => {
      Dummy.setter('name', (value) => {
        return value.toUpperCase();
      });

      dummy = new Dummy();

      dummy.name = 'test';
      expect(dummy.name).toEqual('TEST');
      expect(dummy._properties.name.getValue()).toEqual('TEST');
    });

    it('should support custom getter', () => {
      Dummy.getter('name', (value) => {
        return 'getter-' + value.toUpperCase();
      });

      dummy = new Dummy();

      dummy.name = 'test';
      expect(dummy.name).toEqual('getter-TEST');
      expect(dummy._properties.name._value).toEqual('test');
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
    it('should only get attributes that are defined', () => {
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

      onBeforeValidate = jasmine.createSpy('onBeforeValidate');
      onAfterValidate = jasmine.createSpy('onAfterValidate');

      Dummy.watch('beforeValidate', onBeforeValidate);
      Dummy.watch('afterValidate', onAfterValidate);
    });

    it('should validate attributes', () => {
      dummy.age = 120;
      dummy.name = 'Tan';

      return dummy.validate().then((errors) => {
        expect(errors).toEqual({
          age: ['age must be less than 100 and greater than 0'],
          name: ['Tan does not match /^Tan\\sNguyen$/']
        });
      });
    });

    it('should trigger invalid event', () => {
      dummy = new Dummy({
        name: 'Tan'
      });

      var spy = jasmine.createSpy();

      dummy.on('invalid', spy);

      return dummy.validate().then((errors) => {
        expect(spy).toHaveBeenCalledWith(errors);
      });
    });

    it('should trigger beforeValidate hook', () => {
      return dummy.validate().then(() => {
        expect(onBeforeValidate.calls.count()).toBe(1);
        expect(onBeforeValidate).toHaveBeenCalledWith({
          instance: dummy
        });
      });
    });

    it('should trigger afterValidate hook', () => {
      return dummy.validate().then((errors) => {
        expect(onAfterValidate.calls.count()).toBe(1);
        expect(onAfterValidate).toHaveBeenCalledWith({
          instance: dummy,
          errors: errors
        });
      });
    });
  });
});
