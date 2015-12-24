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
    sprintf = require('sprintf-js').sprintf;

var Model = (function (_Component) {
  _inherits(Model, _Component);

  function Model() {
    var attributes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Model);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Model).call(this));

    _.each(attributes, function (v, k) {
      _this[k] = v;
    });

    _this._errors = {};
    return _this;
  }

  _createClass(Model, [{
    key: 'attributes',
    value: function attributes() {
      throw 'Must be implemented';
    }
  }, {
    key: 'onBeforeValidate',
    value: function onBeforeValidate(options) {
      return true;
    }
  }, {
    key: '_typeValidate',
    value: function _typeValidate(options) {
      var _this2 = this;

      var attributes = this.attributes();

      _.each(attributes, function (attrOpts, attribute) {
        if (!attrOpts.type) {
          return;
        }

        var value = _this2[attribute];
        // The attribute is not provided or null, assuming that
        // the attribute is optional and let the 2nd
        // phase handle it
        if (value === void 0 || value === null) {
          return;
        }

        if (attrOpts.type(value)) {
          return;
        }

        // The first phase aims to provide extra information for the developers
        console.warn(attribute + ' violates ' + attrOpts.type.name + ' type validation with value ' + value + ' of type ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)));
      });
    }
  }, {
    key: 'validate',
    value: function validate() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      options = _.defaults(options, {
        sync: false
      });

      // Phase 1: Type validation
      this._typeValidate(options);

      // Phase 2: Value validation
      if (options.sync) {
        return this._syncValidate(options);
      }

      return this._asyncValidate(options);
    }
  }, {
    key: '_validateEachAttribute',
    value: function _validateEachAttribute(fn, sync) {
      var _this3 = this;

      var attributes = this.attributes();

      _.each(attributes, function (attrOpts, attribute) {
        var value = _this3[attribute];
        var rules = attrOpts.rules || {};

        if (_.isEmpty(rules)) {
          return;
        }

        _.each(rules, function (ruleOpts, rule) {
          var validate = _this3[rule];

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
            msgOpts.attribute = attribute;
            msgOpts.value = value;
            result = sprintf(result, msgOpts);
          }

          fn(attribute, result);
        });
      });
    }
  }, {
    key: '_asyncValidate',
    value: function _asyncValidate() {
      var _this4 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var attributes = this.attributes();
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

        _this4._validateEachAttribute(function (attribute, validationResult) {
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
          _this4._errors = errors;
          return _.isEmpty(_this4._errors);
        });
      }).then(function (result) {
        if (!result) {
          return false;
        }

        var onAfterValidate = _this4.onAfterValidate(options);

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

      var attributes = this.attributes();
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
      this.onAfterValidate(options);
      return _.isEmpty(this._errors);
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
  }]);

  return Model;
})(Component);

Model.Types = require('./types');

module.exports = Model;