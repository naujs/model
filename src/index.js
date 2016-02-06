'use strict';

var Component = require('@naujs/component')
  , util = require('@naujs/util')
  , _ = require('lodash')
  , validators = require('./validators')
  , sprintf = require('sprintf-js').sprintf
  , pluralize = require('pluralize');

// Private methods
// Class
function getModelName() {
  let name = this.modelName;
  if (!name) {
    throw 'Must set name for a model';
  }
  return name;
}

function getPlural() {
  let plural = this.plural;
  if (!plural) {
    plural = pluralize(getModelName.call(this), 2);
  }
  return plural;
}

function getProperties() {
  let properties = this.properties || {};
  if (_.isEmpty(properties)) {
    console.warn('Empty properties');
  }
  return properties;
}

// Instance
function buildProperties() {
  let properties = getProperties.call(this.getClass());
  _.each(properties, (options, name) => {
    defineProperty(this, name, options);
  });
}

function defineProperty(instance, name, options) {
  let Model = instance.getClass();
  let setter = (Model.setters || {})[name];
  let getter = (Model.getters || {})[name];
  let defaultValue = (Model.defaults || {})[name];

  Object.defineProperty(instance, name, {
    get: function() {
      let value = instance._attributes[name];
      return getter ? getter(value) : value;
    },

    set: function(value) {
      instance._attributes[name] = value;
    }
  });
}

class Model extends Component {
  constructor(attributes = {}) {
    super();

    this._attributes = {};
    buildProperties.call(this);

    this.setAttributes(attributes);
    this._errors = {};
  }

  /**
   * Gets all the current attributes. Only those defined in {@link Model#attributes}
   * can be get
   * @method Model#getAttributes
   * @return {Any}
   */
  getAttributes() {
    return _.clone(this._attributes);
  }

  /**
   * Sets attributes for this model. Only those defined
   * in {@link Model#attributes} can be set
   * Due to cross-browser issues, setting the attribute directly
   * via normal this.attributeName is still possible and by-passes all the checks
   * TODO: Apply Proxy to strictly prohibit setting undefined attributes
   * @method Model#setAttributes
   * @param {Object}
   */
  setAttributes(attributes = {}) {
    let properties = getProperties.call(this.getClass());
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
    let properties = getProperties.call(this.getClass());

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
      sync: false
    }).value();

    // Phase 1: Type validation
    this._typeValidate(options);

    // Phase 2: Value validation
    if (options.sync) {
      var result = this._syncValidate(options);
      if (!result) {
        this.trigger('invalid', this.getErrors());
      }
      return result;
    }

    return this._asyncValidate(options).then((result) => {
      if (!result) {
        this.trigger('invalid', this.getErrors());
      }

      return result;
    });
  }

  _validateEachAttribute(fn, sync) {
    let properties = getProperties.call(this.getClass());

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

        if (sync && validate.async) {
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

  _asyncValidate(options = {}) {
    let Promise = util.getPromise();

    let onBeforeValidate = this.onBeforeValidate(options);
    if (!onBeforeValidate.then) {
      onBeforeValidate = new Promise((resolve, reject) => {
        return resolve(onBeforeValidate);
      });
    }

    return onBeforeValidate.then((result) => {
      if (!result) {
        return false;
      }

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
      if (!result) {
        return false;
      }

      let onAfterValidate = this.onAfterValidate(options);

      if (onAfterValidate.then) {
        return onAfterValidate.then(() => {
          return true;
        });
      }

      return true;
    });
  }

  _syncValidate(options = {}) {
    let errors = {};

    if (!this.onBeforeValidate(options)) {
      return false;
    }

    this._validateEachAttribute((attribute, errorMsg) => {
      if (errorMsg) {
        errors[attribute] = errors[attribute] || [];
        errors[attribute].push(errorMsg);
      }
    });

    this._errors = errors;

    if (!_.isEmpty(this._errors)) {
      return false;
    }

    this.onAfterValidate(options);
    return true;
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

Model.Types = require('./types');

module.exports = Model;
