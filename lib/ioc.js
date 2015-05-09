"use strict";
var _ = require('lodash')
var protoBind = Function.prototype.bind

var bindFunction = function (ctor, args) {
    args.unshift(null)
    return protoBind.apply(ctor, args)
}

var bindAllKeys = function (chain) {
    _.each(chain, (v, k) => chain[k] = v.bind(this), this)
};

var instantiate = function (module, ctor) {

    var deps = _.map(module.args, i => this.resolve(i), this)
    var boundCtor = bindFunction(ctor, deps)
    var instance = new boundCtor
    return instance;
};

var instantiateViaFactory = function (module, ctor) {
    return module.factory(this)
}

class Module {
    constructor(ctor) {
        this.ctor = ctor
        this.args = []
        this.isSingleton = false
    }
}

var createAnnotation = function (factory) {
    if (typeof factory !== 'function') {
        throw Error('Factory should be of function type')
    }
    var annotations = {
        as: function (ctor) {
            module = createModule.call(this, ctor)
            module.factory = factory
            return {
                singleton: function (){
                    module.isSingleton = true
                }
            }
        }
    }
    bindAllKeys.call(this, annotations);
    return annotations
}

/**
 *
 * @param {function} ctor Constructor function
 * @returns {Module} Instance of Module
 */
function createModule(ctor) {
    return this.modules[ctor] = new Module(ctor)
}

var getModule = function (ctor) {
    var mod = this.modules[ctor]
    if (mod) {
        return mod
    } else {
        throw Error('class has not been registered: ' + ctor.name || 'unknown')
    }
}
class Container {

    constructor() {
        this.modules = new Map()
    }

    resolve(ctor) {
        var instance, module = getModule.call(this, ctor)
        if (module.instance) {
            instance = module.instance
        }
        else if (module.factory) {
            instance = instantiateViaFactory.call(this, module, ctor)
        }
        else {
            instance = instantiate.call(this, module, ctor);
        }

        if (module.isSingleton) {
            module.instance = instance
        }
        return instance
    }

    registerInstance(instance) {
        return createAnnotation.call(this, (c)=>instance)
    }

    register(factory) {
        return createAnnotation.call(this, factory)
    }

}
module.exports = Container;