"use strict";
var ComponentDescriptor = require('./ComponentDescriptor')
class ComponentContainer {
    constructor() {
        this.components = new Map();
    }

    createDescriptor(component, factory) {
        return this.components[component] = new ComponentDescriptor(component, factory);
    }

    getDescriptor(component) {
        var descriptor = this.components[component];
        if (descriptor) {
            return descriptor;
        } else {
            throw Error('class has not been registered: ' + component.name || 'unknown');
        }
    }
}

module.exports = ComponentContainer;