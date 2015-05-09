"use strict";
const _ = require('lodash');

const AnnotatedClass = require('./annotations');

const A_KEY = AnnotatedClass.A_KEY;

const AC = AnnotatedClass;

const spreadedBind = function (classCtor, args) {
    args.splice(0, 0, null)
    return Function.prototype.bind.apply(classCtor, args);
}

const _resolvePrototype = function (classCtor, baseClass) {
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

const _resolve = function (classCtor, args, baseClass) {
    const _ctor = spreadedBind(classCtor, args);
    _ctor.prototype = _resolvePrototype(classCtor, baseClass);
    return new _ctor;
};

const _resolveAs = function (classCtor, instance, context) {
    var resolution;
    if (resolution = AC.getResolution(classCtor)) {
        return resolution(instance, context);
    }
    return instance;
};

const getFromCache = function (classCtor) {
    if (!AC.isSingleton(classCtor)) {
        return null;
    }
    return _.find(this._singletons, function (i) {
        return i.classCtor === classCtor;
    });
}

const getFromMock = function (classCtor) {
    return _.find(this._providers, function (i) {
        return classCtor === AC.getProviderFor(i);
    });
};

class Injector {
    /**
     *
     * @param _providers
     */
    constructor(..._providers) {
        this._providers = _providers;
        this._singletons = [];
    }

    /**
     *
     * @param {function} classCtor Constructor of the class whose instance is required
     * @returns {object}
     */
    get(classCtor) {
        var baseClass, baseExtension, cachedValue, depMap, instance, mock;
        if (typeof classCtor === 'object') {
            throw Error('Constructor expected');
        }
        if (mock = getFromMock.call(this, classCtor)) {
            return _resolveAs(classCtor, this.get(mock), this);
        }
        depMap = [];
        if (classCtor === Injector) {
            return this;
        }
        if (cachedValue = getFromCache.call(this, classCtor)) {
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
    }

}
/**
 *
 * @param {function} ctor Constructor that needs to be annotated
 * @returns {object} New annotation object
 */
Injector.annotate = function (ctor) {
    return new AnnotatedClass(ctor);
}
module.exports = Injector;