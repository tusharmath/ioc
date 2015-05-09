"use strict";
var _ = require('lodash');
var u = require('./utils');
var ResolutionQueue = require('./ResolutionQueue');
var ComponentDescriptor = require('./ComponentDescriptor');
var ComponentContainer = require('./ComponentContainer');

var resolveComponents = function (container, components) {
    return map(components, i => container.resolve(i));
};

var instantiate = function (componentDescriptor, ctor, container) {
    var resolvedDependencies = resolveComponents(container, componentDescriptor.args);
    return new u.bindFunction(ctor, resolvedDependencies)();
};

var instantiateViaFactory = function (componentDescriptor, component, container) {
    return componentDescriptor.factory(container, component);
}

var createAnnotation = function (factory) {
    if (typeof factory !== 'function') {
        throw Error('Factory should be of function type');
    }
    let componentDescriptor;
    var annotations = {
        singleton: function () {
            componentDescriptor.isSingleton = true;
            return annotations;
        },
        as: function (component) {
            componentDescriptor = this.componentContainer.createDescriptor(component, factory);
            return annotations;
        }
    };
    u.bindAllKeys(annotations, this);
    return annotations;
};

class Container {
    constructor() {
        this.components = new Map();
        this.resolutionQueue = new ResolutionQueue();
        this.componentContainer = new ComponentContainer();
        this.registerInstance(this).as(Container);
    }

    resolve(component) {
        var instance;
        let componentDescriptor = this.componentContainer.getDescriptor(component);
        this.resolutionQueue.add(component);

        if (componentDescriptor.instance) {
            instance = componentDescriptor.instance;
        } else if (componentDescriptor.factory) {
            instance = instantiateViaFactory(componentDescriptor, component, this);
        } else {
            instance = instantiate(componentDescriptor, component);
        }

        if (componentDescriptor.isSingleton) {
            componentDescriptor.instance = instance;
        }
        this.resolutionQueue.remove(component);
        return instance;
    }

    /**
     *
     * @param instance object
     * @return {{as}}
     */
    registerInstance(instance) {
        return createAnnotation.call(this, (c)=>instance);
    }

    register(factory) {
        return createAnnotation.call(this, factory);
    }

    registerWithTypes(...types) {
        var factory = function (c, ctor) {
            var params = _.map(types, (i) => c.resolve(i));
            var ctorBound = u.bindFunction(ctor, params);
            return new ctorBound();
        };
        return createAnnotation.call(this, factory);
    }

}
module.exports = Container;