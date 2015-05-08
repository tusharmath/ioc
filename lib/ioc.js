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

class Container {

    constructor() {
        let _modules = new Map()
        this.getModule = function (ctor) {
            if (_modules[ctor]) {
                return _modules[ctor]
            } else {
                throw Error('class has not been registered')
            }
        }

        this.createModule = function (ctor) {
            _modules[ctor] = {
                args: [],
                isSingleton: false
            }

        }
    }
    set(ctor, key, value) {
        var module = this.getModule(ctor)
        module[key] = value
    }

    resolve(ctor) {
        var module = this.getModule(ctor)
        if (module.instance) {
            return module.instance
        }
        var instance = instantiate.call(this, module, ctor);
        if (module.isSingleton) {
            module.instance = instance
        }
        return instance
    }

    register(ctor) {
        this.createModule(ctor)
        var annotations = {
            inject: function (...args) {
                var module = this.getModule(ctor)
                module.args = args
                return annotations
            },
            asSingleton: function () {
                var module = this.getModule(ctor)
                module.isSingleton = true
                return annotations
            }
        }
        bindAllKeys.call(this, annotations);
        return annotations
    }

}
module.exports = Container;