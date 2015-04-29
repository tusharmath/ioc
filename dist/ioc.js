(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.IOC = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ANNOTATIONS, AnnotatedClass, ExtendsAnnotation, InjectAnnotation, ProviderAnnotation, ResolveAsAnnotation, SingletonAnnotation, TransientAnnotation, getAnnotationKey,
  slice = [].slice;

ANNOTATIONS = {
  'asSingleton': SingletonAnnotation = function() {},
  'asTransient': TransientAnnotation = function() {},
  'extends': ExtendsAnnotation = function(baseClass) {
    this.baseClass = baseClass;
  },
  'inject': InjectAnnotation = function() {
    var deps;
    deps = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this.deps = deps;
  },
  'resolveAs': ResolveAsAnnotation = function(callback) {
    this.callback = callback;
  },
  'providerFor': ProviderAnnotation = function(classCtor1) {
    this.classCtor = classCtor1;
  }
};

getAnnotationKey = function(ann) {
  var k, v;
  for (k in ANNOTATIONS) {
    v = ANNOTATIONS[k];
    if (v === ann) {
      return k;
    }
  }
  return null;
};

AnnotatedClass = (function() {
  var AC, A_KEY;

  A_KEY = AnnotatedClass.A_KEY = "__annotations__";

  AC = AnnotatedClass;

  function AnnotatedClass(classCtor1) {
    this.classCtor = classCtor1;
    this.classCtor[A_KEY] = this.annotations = {};
    this._create(ANNOTATIONS);
  }

  AnnotatedClass.prototype._applyAnnotation = function(ann, args) {
    var _ann, aKey;
    if (args == null) {
      args = [];
    }
    args.unshift(null);
    _ann = ann.bind.apply(ann, args);
    aKey = getAnnotationKey(ann);
    this.annotations[aKey] = new _ann;
    return this;
  };

  AnnotatedClass.prototype._createAnnotationFunction = function(annotationName, annotationValue) {
    return (function(_this) {
      return function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return _this._applyAnnotation(ANNOTATIONS[annotationName], args);
      };
    })(this);
  };

  AnnotatedClass.prototype._create = function(annotations) {
    var annotationName, annotationValue, results;
    results = [];
    for (annotationName in annotations) {
      annotationValue = annotations[annotationName];
      results.push(this[annotationName] = this._createAnnotationFunction(annotationName, annotationValue));
    }
    return results;
  };

  AC.isExtension = function(classCtor) {
    return AC.isAnnotated(classCtor, ExtendsAnnotation);
  };

  AC.getParent = function(classCtor) {
    var annotation;
    annotation = AC.getAnnotation(classCtor, ExtendsAnnotation);
    if (annotation) {
      return annotation.baseClass;
    }
    return null;
  };

  AC.isDependent = function(classCtor) {
    return AC.isAnnotated(classCtor, InjectAnnotation);
  };

  AC.getDependencies = function(classCtor) {
    var annotation;
    annotation = AC.getAnnotation(classCtor, InjectAnnotation);
    if (annotation) {
      return annotation.deps;
    }
    return null;
  };

  AC.isSingleton = function(classCtor) {
    return AC.isAnnotated(classCtor, SingletonAnnotation);
  };

  AC.getProviderFor = function(classCtor) {
    var annotation;
    annotation = AC.getAnnotation(classCtor, ProviderAnnotation);
    if (annotation) {
      return annotation.classCtor;
    }
    return null;
  };

  AC.getResolution = function(classCtor) {
    var annotation;
    annotation = AC.getAnnotation(classCtor, ResolveAsAnnotation);
    if (annotation) {
      return annotation.callback;
    }
    return null;
  };

  AC.isAnnotated = function(ctor, annotation) {
    var hasAnnotation, ref;
    hasAnnotation = (ref = ctor[A_KEY]) != null ? ref[getAnnotationKey(annotation)] : void 0;
    return hasAnnotation && hasAnnotation instanceof annotation;
  };

  AC.getAnnotation = function(ctor, annotation) {
    if (AC.isAnnotated.apply(null, arguments)) {
      return ctor[A_KEY][getAnnotationKey(annotation)];
    }
    return null;
  };

  return AnnotatedClass;

})();

module.exports = AnnotatedClass;



},{}],2:[function(require,module,exports){
var AC, A_KEY, AnnotatedClass, Injector, _, _bind, _resolve, _resolveAs, _resolvePrototype,
  slice = [].slice;

_ = require('./utils.coffee');

AnnotatedClass = require('./annotations.coffee');

A_KEY = AnnotatedClass.A_KEY;

AC = AnnotatedClass;

_bind = Function.prototype.bind;

_resolvePrototype = function(classCtor, baseClass) {
  var baseExtension, protoTemp;
  protoTemp = _.assign({}, classCtor.prototype);
  if (AC.isExtension(classCtor)) {
    classCtor.prototype = baseClass;
    classCtor.__super__ = {};
    baseExtension = AC.getParent(classCtor);
    _.assign(classCtor.__super__, baseExtension.prototype);
  }
  return _.assign(classCtor.prototype, protoTemp);
};

_resolve = function(classCtor, args, baseClass) {
  var Ctor, _ctor;
  Ctor = (function() {
    function Ctor() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      classCtor.apply(this, args);
    }

    return Ctor;

  })();
  Ctor.prototype = _resolvePrototype(classCtor, baseClass);
  args.unshift(null);
  _ctor = _bind.apply(Ctor, args);
  return new _ctor;
};

_resolveAs = function(classCtor, instance, context) {
  var resolution;
  if (resolution = AC.getResolution(classCtor)) {
    return resolution(instance, context);
  }
  return instance;
};

Injector = (function() {
  var annotate;

  function Injector() {
    var _providers;
    _providers = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this._providers = _providers;
    this._singletons = [];
  }

  Injector.prototype._getFromCache = function(classCtor) {
    if (!AC.isSingleton(classCtor)) {
      return null;
    }
    return _.find(this._singletons, function(i) {
      return i.classCtor === classCtor;
    });
  };

  Injector.annotate = annotate = function(ctor) {
    return new AnnotatedClass(ctor);
  };

  Injector.prototype._getFromMock = function(classCtor) {
    return _.find(this._providers, function(i) {
      return classCtor === AC.getProviderFor(i);
    });
  };

  Injector.prototype.get = function(classCtor) {
    var baseClass, baseExtension, cachedValue, depMap, instance, mock;
    if (typeof classCtor === 'object') {
      throw Error('Constructor expected');
    }
    if (mock = this._getFromMock(classCtor)) {
      return _resolveAs(classCtor, this.get(mock), this);
    }
    depMap = [];
    if (classCtor === Injector) {
      return this;
    }
    if (cachedValue = this._getFromCache(classCtor)) {
      return cachedValue.instance;
    }
    if (AC.isDependent(classCtor)) {
      depMap = _.map(AC.getDependencies(classCtor), (function(_this) {
        return function(i) {
          return _this.get(i);
        };
      })(this));
    }
    if (AC.isExtension(classCtor)) {
      baseExtension = AC.getParent(classCtor);
      if (AC.isSingleton(baseExtension)) {
        throw new Error("can not instantiate if the class extends a singleton");
      }
      baseClass = this.get(AC.getParent(classCtor));
    }
    instance = _resolve(classCtor, depMap, baseClass);
    instance = _resolveAs(classCtor, instance, this);
    if (AC.isSingleton(classCtor)) {
      this._singletons.push({
        instance: instance,
        classCtor: classCtor
      });
    }
    return instance;
  };

  return Injector;

})();

module.exports = Injector;



},{"./annotations.coffee":1,"./utils.coffee":3}],3:[function(require,module,exports){
exports.find = function(array, cb) {
  var i, j, len;
  for (j = 0, len = array.length; j < len; j++) {
    i = array[j];
    if (cb(i)) {
      return i;
    }
  }
  return null;
};

exports.assign = function(obj, src) {
  var k, v;
  for (k in src) {
    v = src[k];
    obj[k] = v;
  }
  return obj;
};

exports.map = function(items, cb) {
  var i, j, len, results;
  results = [];
  for (j = 0, len = items.length; j < len; j++) {
    i = items[j];
    results.push(cb(i));
  }
  return results;
};



},{}]},{},[2])(2)
});