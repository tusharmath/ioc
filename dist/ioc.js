(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var AnnotatedClass, ExtendsAnnotation, InjectAnnotation, ResolveAsAnnotation, SingletonAnnotation, TransientAnnotation,
  slice = [].slice;

SingletonAnnotation = (function() {
  function SingletonAnnotation() {}

  return SingletonAnnotation;

})();

SingletonAnnotation.A_KEY = '$lifeCycle';

TransientAnnotation = (function() {
  function TransientAnnotation() {}

  return TransientAnnotation;

})();

TransientAnnotation.A_KEY = '$lifeCycle';

ExtendsAnnotation = (function() {
  function ExtendsAnnotation(baseClass1) {
    this.baseClass = baseClass1;
  }

  return ExtendsAnnotation;

})();

ExtendsAnnotation.A_KEY = '$extends';

InjectAnnotation = (function() {
  function InjectAnnotation(deps) {
    this.deps = deps;
  }

  return InjectAnnotation;

})();

InjectAnnotation.A_KEY = '$inject';

ResolveAsAnnotation = (function() {
  function ResolveAsAnnotation(callback) {
    this.callback = callback;
  }

  return ResolveAsAnnotation;

})();

ResolveAsAnnotation.A_KEY = '$resolveAs';

AnnotatedClass = (function() {
  var AC, A_KEY;

  A_KEY = AnnotatedClass.A_KEY = "__annotations__";

  AC = AnnotatedClass;

  function AnnotatedClass(classCtor1) {
    this.classCtor = classCtor1;
    this.classCtor[A_KEY] = this.annotations = {};
  }

  AnnotatedClass.prototype.asSingleton = function() {
    this.annotations[SingletonAnnotation.A_KEY] = new SingletonAnnotation;
    return this;
  };

  AnnotatedClass.prototype.asTransient = function() {
    this.annotations[TransientAnnotation.A_KEY] = new TransientAnnotation;
    return this;
  };

  AnnotatedClass.prototype["extends"] = function(baseClass) {
    this.annotations[ExtendsAnnotation.A_KEY] = new ExtendsAnnotation(baseClass);
    return this;
  };

  AnnotatedClass.prototype.inject = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this.annotations[InjectAnnotation.A_KEY] = new InjectAnnotation(args);
    return this;
  };

  AnnotatedClass.prototype.resolveAs = function(cb) {
    this.annotations[ResolveAsAnnotation.A_KEY] = new ResolveAsAnnotation(cb);
    return this;
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

  AC.isAnnotated = function(ctor, annotation) {
    var hasAnnotation, ref;
    hasAnnotation = (ref = ctor[A_KEY]) != null ? ref[annotation.A_KEY] : void 0;
    return hasAnnotation && hasAnnotation instanceof annotation;
  };

  AC.getAnnotation = function(ctor, annotation) {
    if (AC.isAnnotated.apply(null, arguments)) {
      return ctor[A_KEY][annotation.A_KEY];
    }
    return null;
  };

  return AnnotatedClass;

})();

module.exports = {
  SingletonAnnotation: SingletonAnnotation,
  TransientAnnotation: TransientAnnotation,
  ExtendsAnnotation: ExtendsAnnotation,
  InjectAnnotation: InjectAnnotation,
  AnnotatedClass: AnnotatedClass,
  ResolveAsAnnotation: ResolveAsAnnotation
};



},{}],2:[function(require,module,exports){
var AC, A_KEY, AnnotatedClass, ExtendsAnnotation, Injector, ResolveAsAnnotation, _, _bind, _resolve, _resolveAs, _resolvePrototype, ref,
  slice = [].slice;

_ = require('./utils.coffee');

ref = require('./annotations.coffee'), ResolveAsAnnotation = ref.ResolveAsAnnotation, AnnotatedClass = ref.AnnotatedClass, ExtendsAnnotation = ref.ExtendsAnnotation;

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

_resolveAs = function(classCtor, instance) {
  var annotation;
  if (AC.isAnnotated(classCtor, ResolveAsAnnotation)) {
    annotation = AC.getAnnotation(classCtor, ResolveAsAnnotation);
    return annotation.callback(instance);
  }
  return instance;
};

Injector = (function() {
  var annotate;

  function Injector() {
    this._singletons = [];
    this._mocks = [];
  }

  Injector.prototype._getFromCache = function(classCtor) {
    if (!AC.isSingleton(classCtor)) {
      return null;
    }
    return _.find(this._singletons, function(i) {
      return i instanceof classCtor;
    });
  };

  Injector.annotate = annotate = function(ctor) {
    return new AnnotatedClass(ctor);
  };

  Injector.prototype._getFromMock = function(classCtor) {
    return _.find(this._mocks, function(i) {
      return classCtor === i.classCtor;
    });
  };

  Injector.prototype.providerFor = function(classCtor, instance) {
    this._mocks.push({
      classCtor: classCtor,
      instance: instance
    });
    return this;
  };

  Injector.prototype.get = function(classCtor) {
    var baseClass, baseExtension, depMap, instance, mock;
    if (mock = this._getFromMock(classCtor)) {
      return mock.instance;
    }
    depMap = [];
    if (classCtor === Injector) {
      return this;
    }
    if (instance = this._getFromCache(classCtor)) {
      return _resolveAs(classCtor, instance);
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
    if (AC.isSingleton(classCtor)) {
      this._singletons.push(instance);
    }
    instance = _resolveAs(classCtor, instance);
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



},{}]},{},[2]);
