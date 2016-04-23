'use strict';

var Component = require('@naujs/component')
  , util = require('@naujs/util')
  , _ = require('lodash')
  , pluralize = require('pluralize')
  , Promise = util.getPromise()
  , Property = require('@naujs/property');

// Helper methods
// Instance
function buildProperties() {
  let properties = this.getClass().getProperties();
  _.each(properties, (options, name) => {
    defineProperty(this, name, options);
  });
}

function defineProperty(instance, name, options) {
  let Model = instance.getClass();
  instance._properties = instance._properties || {};
  instance._properties[name] = new Property(name, options);

  Object.defineProperty(instance, name, {
    get: function() {
      return instance._properties[name].getValue();
    },

    set: function(value) {
      instance._properties[name].setValue(value);
    }
  });
}

class Model extends Component {
  static getModelName() {
    return this.modelName || this.name;
  }

  static getPluralName() {
    let plural = this.pluralName;
    if (!plural) {
      plural = pluralize(this.getModelName(), 2);
    }
    return plural;
  }

  static getProperties() {
    let properties = this.properties || {};
    return properties;
  }

  static setter(name, fn) {
    var properties = this.getProperties();
    var prop = properties[name];
    if (prop) {
      prop.set = fn;
    }
    return this;
  }

  static getter(name, fn) {
    var properties = this.getProperties();
    var prop = properties[name];
    if (prop) {
      prop.get = fn;
    }
    return this;
  }

  constructor(attributes = {}) {
    super();

    this._properties = {};
    buildProperties.call(this);

    this.setAttributes(attributes);
    this._errors = {};
  }

  /**
   * Gets all the current attributes. Only those defined in {@link Model.properties}
   * can be get
   * @method Model#getAttributes
   * @return {Any}
   */
  getAttributes() {
    return _.chain(this._properties).toPairs().map((pair) => {
      var value = pair[1].getValue();
      if (value === undefined) return null;
      return [pair[0], value];
    }).compact().fromPairs().value();
  }

  /**
   * Sets attributes for this model. Only those defined
   * in {@link Model.properties} can be set
   * Due to cross-browser issues, setting the attribute directly
   * via normal this.attributeName is still possible and by-passes all the checks
   * TODO: Apply Proxy to strictly prohibit setting undefined attributes
   * @method Model#setAttributes
   * @param {Object}
   */
  setAttributes(attributes = {}) {
    _.each(this._properties, (prop, name) => {
      if (attributes[name] !== undefined) prop.setValue(attributes[name]);
    });

    return this;
  }

  validate() {
    this._errors = {};
    return this.runHook('beforeValidate', {
      instance: this
    }).then(() => {
      var promises = _.map(this._properties, (prop, name) => {
        return prop.validate({
          instance: this
        }).then((errors) => {
          if (errors && errors.length) this.setError(name, errors);
        });
      });

      return Promise.all(promises).then(() => {
        return this.getErrors();
      });
    }).then((errors) => {
      if (errors) {
        this.trigger('invalid', this.getErrors());
      }

      return errors;
    }).then((errors) => {
      return this.runHook('afterValidate', {
        instance: this,
        errors: errors
      }).then(() => {
        return errors;
      });
    });
  }

  setError(prop, errors) {
    this._errors = this._errors || {};
    this._errors[prop] = errors;
    return this;
  }

  getError(prop) {
    return (this._errors || {})[prop];
  }

  getErrors() {
    return _.isEmpty(this._errors) ? null : this._errors;
  }

  toJSON() {
    return this.getAttributes();
  }
}

Model.Property = Property;
Model.defineProperty = defineProperty;

module.exports = Model;
