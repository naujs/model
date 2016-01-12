var Component = require('@naujs/component')
  , util = require('@naujs/util')
  , _ = require('lodash')
  , validators = require('./validators')
  , sprintf = require('sprintf-js').sprintf;

class Model extends Component {
  constructor(attributes = {}) {
    super();
    _.each(attributes, (v, k) => {
      this[k] = v;
    });

    this._errors = {};
  }

  attributes() {
    return {};
  }

  onBeforeValidate(options) {
    return true;
  }

  _typeValidate(options) {
    let attributes = this.attributes();

    _.each(attributes, (attrOpts, attribute) => {
      if (!attrOpts.type) {
        return;
      }

      let value = this[attribute];
      // The attribute is not provided or null, assuming that
      // the attribute is optional and let the 2nd
      // phase handle it
      if (value === void(0) || value === null) {
        return;
      }

      if (attrOpts.type(value)) {
        return;
      }

      // The first phase aims to provide extra information for the developers
      console.warn(`${attribute} violates ${attrOpts.type.name} type validation with value ${value} of type ${typeof value}`);
    });
  }

  validate(options = {}) {
    options = _.defaults(options, {
      sync: false
    });

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
    let attributes = this.attributes();

    _.each(attributes, (attrOpts, attribute) => {
      let value = this[attribute];
      let rules = attrOpts.rules || {};

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
          msgOpts.attribute = attribute;
          msgOpts.value = value;
          result = sprintf(result, msgOpts);
        }

        fn(attribute, result);
      });
    });
  }

  _asyncValidate(options = {}) {
    let attributes = this.attributes();
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
    let attributes = this.attributes();
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
}

Model.Types = require('./types');

module.exports = Model;