'use strict';

var Component = require('@naujs/component')
  , util = require('@naujs/util')
  , _ = require('lodash')
  , validators = require('./validators')
  , sprintf = require('sprintf-js').sprintf
  , pluralize = require('pluralize')
  , Promise = util.getPromise();

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

  Object.defineProperty(instance, name, {
    get: function() {
      let getter = (Model._getters || {})[name];
      let defaultValue = (Model._defaults || {})[name];
      let value = instance._attributes[name];
      value = getter ? getter(value) : value;

      if (defaultValue && value == undefined) {
        value = defaultValue;
      }

      return value;
    },

    set: function(value) {
      let setter = (Model._setters || {})[name];
      instance._attributes[name] = setter ? setter(value) : value;
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

  static setter(property, fn) {
    this._setters = this._setters || {};
    this._setters[property] = fn;
    return this;
  }

  static getter(property, fn) {
    this._getters = this._getters || {};
    this._getters[property] = fn;
    return this;
  }

  constructor(attributes = {}, options = {}) {
    super();

    this._attributes = {};
    buildProperties.call(this);

    this.setAttributes(attributes, options);
    this._errors = {};
  }

  /**
   * Gets all the current attributes. Only those defined in {@link Model.properties}
   * can be get
   * @method Model#getAttributes
   * @return {Any}
   */
  getAttributes() {
    return _.clone(this._attributes);
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
    let properties = this.getClass().getProperties();
    _.each(attributes, (value, key) => {
      if (properties[key]) {
        this[key] = value;
      }
    });

    return this;
  }

  onBeforeValidate(options) {
    return true;
  }

  _typeValidate(options) {
    let properties = this.getClass().getProperties();

    _.each(properties, (options, property) => {
      if (!options.type) {
        return;
      }

      let value = this[property];
      // The property is not provided or null, assuming that
      // the property is optional and let the 2nd
      // phase handle it
      if (value === void(0) || value === null) {
        return;
      }

      if (options.type(value)) {
        return;
      }

      // The first phase aims to provide extra information for the developers
      console.warn(`${property} violates ${options.type.name} type validation with value ${value} of type ${typeof value}`);
    });
  }

  validate(options = {}) {
    options = _.chain(options).clone().defaults({

    }).value();

    // Phase 1: Type validation
    this._typeValidate(options);

    // Phase 2: Value validation
    return this.runHook('beforeValidate', this, options).then(() => {

    }).then(() => {
      let errors = {};
      let tasks = [];

      this._validateEachAttribute((attribute, validationResult) => {
        if (!validationResult.then) {
          validationResult = new Promise((resolve, reject) => {
            resolve(validationResult);
          });
        }

        tasks.push(validationResult.then((errorMsg) => {
          if (errorMsg) {
            errors[attribute] = errors[attribute] || [];
            errors[attribute].push(errorMsg);
          }
        }));
      });

      return Promise.all(tasks).then(() => {
        this._errors = errors;
        return _.isEmpty(this._errors);
      });
    }).then((result) => {
      return this.runHook('afterValidate', result, this, options).then(() => {
        return result;
      });
    }).then((result) => {
      if (!result) {
        this.trigger('invalid', this.getErrors());
      }

      return result;
    });
  }

  _validateEachAttribute(fn) {
    let properties = this.getClass().getProperties();

    _.each(properties, (options, property) => {
      let value = this[property];
      let rules = options.rules || {};

      if (_.isEmpty(rules)) {
        return;
      }

      _.each(rules, (ruleOpts, rule) => {
        let validate = this[rule];

        if (!validate) {
          validate = validators[rule];
        }

        if (!validate) {
          console.warn(`Validator ${rule} does not exist`);
          return;
        }

        let result = validate(value, ruleOpts);
        let msgOpts = {};
        if (_.isObject(ruleOpts)) {
          msgOpts = ruleOpts;
        }

        if (result) {
          msgOpts.property = property;
          msgOpts.value = value;
          result = sprintf(result, msgOpts);
        }

        fn(property, result);
      });
    });
  }

  onAfterValidate(options) {
    return true;
  }

  getError(attribute) {
    return this._errors[attribute];
  }

  getErrors() {
    return this._errors;
  }

  toJSON() {
    return this.getAttributes();
  }
}

Model.defineProperty = defineProperty;
Model.Types = require('./types');

module.exports = Model;
