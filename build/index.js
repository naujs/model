'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Component = require('@naujs/component'),
    util = require('@naujs/util'),
    _ = require('lodash'),
    validators = require('./validators'),
    sprintf = require('sprintf-js').sprintf,
    pluralize = require('pluralize');

// Helper methods
// Class
function getModelName() {
  var name = this.modelName;
  if (!name) {
    throw 'Must set name for a model';
  }
  return name;
}

function getPluralName() {
  var plural = this.pluralName;
  if (!plural) {
    plural = pluralize(getModelName.call(this), 2);
  }
  return plural;
}

function getProperties() {
  var properties = this.properties || {};
  if (_.isEmpty(properties)) {
    console.warn('Empty properties');
  }
  return properties;
}

// Instance
function buildProperties() {
  var _this = this;

  var properties = getProperties.call(this.getClass());
  _.each(properties, function (options, name) {
    defineProperty(_this, name, options);
  });
}

function defineProperty(instance, name, options) {
  var Model = instance.getClass();
  var setter = (Model.setters || {})[name];
  var getter = (Model.getters || {})[name];
  var defaultValue = (Model.defaults || {})[name];

  Object.defineProperty(instance, name, {
    get: function get() {
      var value = instance._attributes[name];
      return getter ? getter(value) : value;
    },

    set: function set(value) {
      instance._attributes[name] = value;
    }
  });
}

var Model = (function (_Component) {
  _inherits(Model, _Component);

  function Model() {
    var attributes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Model);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Model).call(this));

    _this2._attributes = {};
    buildProperties.call(_this2);

    _this2.setAttributes(attributes);
    _this2._errors = {};
    return _this2;
  }

  /**
   * Gets all the current attributes. Only those defined in {@link Model#attributes}
   * can be get
   * @method Model#getAttributes
   * @return {Any}
   */

  _createClass(Model, [{
    key: 'getAttributes',
    value: function getAttributes() {
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

  }, {
    key: 'setAttributes',
    value: function setAttributes() {
      var _this3 = this;

      var attributes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var properties = getProperties.call(this.getClass());
      _.each(attributes, function (value, key) {
        if (properties[key]) {
          _this3[key] = value;
        }
      });

      return this;
    }
  }, {
    key: 'onBeforeValidate',
    value: function onBeforeValidate(options) {
      return true;
    }
  }, {
    key: '_typeValidate',
    value: function _typeValidate(options) {
      var _this4 = this;

      var properties = getProperties.call(this.getClass());

      _.each(properties, function (options, property) {
        if (!options.type) {
          return;
        }

        var value = _this4[property];
        // The property is not provided or null, assuming that
        // the property is optional and let the 2nd
        // phase handle it
        if (value === void 0 || value === null) {
          return;
        }

        if (options.type(value)) {
          return;
        }

        // The first phase aims to provide extra information for the developers
        console.warn(property + ' violates ' + options.type.name + ' type validation with value ' + value + ' of type ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)));
      });
    }
  }, {
    key: 'validate',
    value: function validate() {
      var _this5 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

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

      return this._asyncValidate(options).then(function (result) {
        if (!result) {
          _this5.trigger('invalid', _this5.getErrors());
        }

        return result;
      });
    }
  }, {
    key: '_validateEachAttribute',
    value: function _validateEachAttribute(fn, sync) {
      var _this6 = this;

      var properties = getProperties.call(this.getClass());

      _.each(properties, function (options, property) {
        var value = _this6[property];
        var rules = options.rules || {};

        if (_.isEmpty(rules)) {
          return;
        }

        _.each(rules, function (ruleOpts, rule) {
          var validate = _this6[rule];

          if (!validate) {
            validate = validators[rule];
          }

          if (!validate) {
            console.warn('Validator ' + rule + ' does not exist');
            return;
          }

          if (sync && validate.async) {
            return;
          }

          var result = validate(value, ruleOpts);
          var msgOpts = {};
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
  }, {
    key: '_asyncValidate',
    value: function _asyncValidate() {
      var _this7 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var Promise = util.getPromise();

      var onBeforeValidate = this.onBeforeValidate(options);
      if (!onBeforeValidate.then) {
        onBeforeValidate = new Promise(function (resolve, reject) {
          return resolve(onBeforeValidate);
        });
      }

      return onBeforeValidate.then(function (result) {
        if (!result) {
          return false;
        }

        var errors = {};
        var tasks = [];

        _this7._validateEachAttribute(function (attribute, validationResult) {
          if (!validationResult.then) {
            validationResult = new Promise(function (resolve, reject) {
              resolve(validationResult);
            });
          }

          tasks.push(validationResult.then(function (errorMsg) {
            if (errorMsg) {
              errors[attribute] = errors[attribute] || [];
              errors[attribute].push(errorMsg);
            }
          }));
        });

        return Promise.all(tasks).then(function () {
          _this7._errors = errors;
          return _.isEmpty(_this7._errors);
        });
      }).then(function (result) {
        if (!result) {
          return false;
        }

        var onAfterValidate = _this7.onAfterValidate(options);

        if (onAfterValidate.then) {
          return onAfterValidate.then(function () {
            return true;
          });
        }

        return true;
      });
    }
  }, {
    key: '_syncValidate',
    value: function _syncValidate() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var errors = {};

      if (!this.onBeforeValidate(options)) {
        return false;
      }

      this._validateEachAttribute(function (attribute, errorMsg) {
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
  }, {
    key: 'onAfterValidate',
    value: function onAfterValidate(options) {
      return true;
    }
  }, {
    key: 'getError',
    value: function getError(attribute) {
      return this._errors[attribute];
    }
  }, {
    key: 'getErrors',
    value: function getErrors() {
      return this._errors;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.getAttributes();
    }
  }]);

  return Model;
})(Component);

Model.Types = require('./types');
Model.getProperties = getProperties;
Model.getModelName = getModelName;
Model.getPluralName = getPluralName;

module.exports = Model;