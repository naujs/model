'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Component = require('@naujs/component'),
    util = require('@naujs/util'),
    _ = require('lodash'),
    pluralize = require('pluralize'),
    Promise = util.getPromise(),
    Property = require('@naujs/property');

// Helper methods
// Instance
function buildProperties() {
  var _this = this;

  var properties = this.getClass().getProperties();
  _.each(properties, function (options, name) {
    defineProperty(_this, name, options);
  });
}

function defineProperty(instance, name, options) {
  var Model = instance.getClass();
  instance._properties = instance._properties || {};
  instance._properties[name] = new Property(name, options);

  Object.defineProperty(instance, name, {
    get: function get() {
      return instance._properties[name].getValue();
    },

    set: function set(value) {
      instance._properties[name].setValue(value);
    }
  });
}

var Model = (function (_Component) {
  _inherits(Model, _Component);

  _createClass(Model, null, [{
    key: 'getModelName',
    value: function getModelName() {
      return this.modelName || this.name;
    }
  }, {
    key: 'getPluralName',
    value: function getPluralName() {
      var plural = this.pluralName;
      if (!plural) {
        plural = pluralize(this.getModelName(), 2);
      }
      return plural;
    }
  }, {
    key: 'getProperties',
    value: function getProperties() {
      var properties = this.properties || {};
      return properties;
    }
  }, {
    key: 'setter',
    value: function setter(name, fn) {
      var properties = this.getProperties();
      var prop = properties[name];
      if (prop) {
        prop.set = fn;
      }
      return this;
    }
  }, {
    key: 'getter',
    value: function getter(name, fn) {
      var properties = this.getProperties();
      var prop = properties[name];
      if (prop) {
        prop.get = fn;
      }
      return this;
    }
  }]);

  function Model() {
    var attributes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Model);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Model).call(this));

    _this2._properties = {};
    buildProperties.call(_this2);

    _this2.setAttributes(attributes);
    _this2._errors = {};
    return _this2;
  }

  /**
   * Gets all the current attributes. Only those defined in {@link Model.properties}
   * can be get
   * @method Model#getAttributes
   * @return {Any}
   */

  _createClass(Model, [{
    key: 'getAttributes',
    value: function getAttributes() {
      return _.chain(this._properties).toPairs().map(function (pair) {
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

  }, {
    key: 'setAttributes',
    value: function setAttributes() {
      var attributes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _.each(this._properties, function (prop, name) {
        if (attributes[name] !== undefined) prop.setValue(attributes[name]);
      });

      return this;
    }
  }, {
    key: 'validate',
    value: function validate() {
      var _this3 = this;

      return this.runHook('beforeValidate', {
        instance: this
      }).then(function () {
        var promises = _.map(_this3._properties, function (prop, name) {
          return prop.validate({
            instance: _this3
          }).then(function (errors) {
            if (errors && errors.length) _this3.setError(name, errors);
          });
        });

        return Promise.all(promises).then(function () {
          return _this3.getErrors();
        });
      }).then(function (errors) {
        if (errors) {
          _this3.trigger('invalid', _this3.getErrors());
        }

        return !errors;
      }).then(function (result) {
        return _this3.runHook('afterValidate', {
          instance: _this3,
          result: result
        }).then(function () {
          return result;
        });
      });
    }
  }, {
    key: 'setError',
    value: function setError(prop, errors) {
      this._errors = this._errors || {};
      this._errors[prop] = errors;
      return this;
    }
  }, {
    key: 'getError',
    value: function getError(prop) {
      return (this._errors || {})[prop];
    }
  }, {
    key: 'getErrors',
    value: function getErrors() {
      return _.isEmpty(this._errors) ? null : this._errors;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.getAttributes();
    }
  }]);

  return Model;
})(Component);

Model.defineProperty = defineProperty;

module.exports = Model;