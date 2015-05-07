"use strict";
var AC, A_KEY, AnnotatedClass, Injector, _, _bind, _resolve, _resolveAs, _resolvePrototype,
    slice = [].slice;

_ = require('lodash');

AnnotatedClass = require('./annotations');

A_KEY = AnnotatedClass.A_KEY;

AC = AnnotatedClass;

_bind = Function.prototype.bind;

_resolvePrototype = function (classCtor, baseClass) {
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

_resolve = function (classCtor, args, baseClass) {
    var Ctor, _ctor;
    Ctor = (function () {
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

_resolveAs = function (classCtor, instance, context) {
    var resolution;
    if (resolution = AC.getResolution(classCtor)) {
        return resolution(instance, context);
    }
    return instance;
};

Injector = (function () {
    var annotate;

    function Injector() {
        var _providers;
        _providers = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        this._providers = _providers;
        this._singletons = [];
    }

    Injector.prototype._getFromCache = function (classCtor) {
        if (!AC.isSingleton(classCtor)) {
            return null;
        }
        return _.find(this._singletons, function (i) {
            return i.classCtor === classCtor;
        });
    };

    Injector.annotate = annotate = function (ctor) {
        return new AnnotatedClass(ctor);
    };

    Injector.prototype._getFromMock = function (classCtor) {
        return _.find(this._providers, function (i) {
            return classCtor === AC.getProviderFor(i);
        });
    };

    Injector.prototype.get = function (classCtor) {
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
            depMap = _.map(AC.getDependencies(classCtor), (function (_this) {
                return function (i) {
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