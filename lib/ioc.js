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
    return module.factory(this, ctor)
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
        singleton: function () {
            module.isSingleton = true
            return annotations
        },
        as: function (ctor) {
            module = createModule.call(this, ctor)
            module.factory = factory
            return annotations
        }
    }
    bindAllKeys.call(this, annotations);
    return annotations
}

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
var nativeFunctionBind = function (ctor, params) {
    /*
     ctor.bind(null, arg1, arg2)
     ctor.bind.apply(ctor, [null, arg1, arg2])
     Function.prototype.bind.apply(ctor, [null, arg1, arg2])
     */

    params.splice(0, 0, null)
    return Function.prototype.bind.apply(ctor, params);
};

class ResolutionQueue {
    constructor() {
        this.clear()
    }

    add(ctor) {
        if (this.queue[ctor]) {
            throw Error('cyclic dependency detected at: ' + ctor.name)
        }
        this.queue[ctor] = true
    }

    remove(ctor) {
        this.queue[ctor] = false
    }

    clear() {
        this.queue = new Map()
    }
}

class Container {

    constructor() {
        this.modules = new Map()
        this.registerInstance(this).as(Container)
        this.resolutionQueue = new ResolutionQueue()
    }

    resolve(ctor) {
        var instance
        let module = getModule.call(this, ctor)
        this.resolutionQueue.add(ctor)
        if (module.instance) {
            instance = module.instance
        } else if (module.factory) {
            instance = instantiateViaFactory.call(this, module, ctor)
        } else {
            instance = instantiate.call(this, module, ctor);
        }

        if (module.isSingleton) {
            module.instance = instance
        }
        this.resolutionQueue.remove(ctor)
        return instance
    }

    registerInstance(instance) {
        return createAnnotation.call(this, (c)=>instance)
    }

    register(factory) {
        return createAnnotation.call(this, factory)
    }

    registerWithTypes(...types) {
        var factory = function (c, ctor) {
            var params = _.map(types, (i) => c.resolve(i))
            var ctorBound = nativeFunctionBind(ctor, params)
            return new ctorBound()
        }
        return createAnnotation.call(this, factory)
    }

}
module.exports = Container;