'use strict'
var ComponentDescriptor = require('./ComponentDescriptor')
class ComponentContainer {
  /**
   * Contains holds a MAP of Components and their Descriptors
   * @constructor
   */
  constructor() {
    this.components = new Map()
  }

  createDescriptor(component, factory) {
    return this.components[component] = new ComponentDescriptor(component, factory)
  }

  /**
   *
   * @param component
   * @returns {{ComponentDescriptor}}
   */
  getDescriptor(component) {
    var descriptor = this.components[component]
    if (descriptor) {
      return descriptor
    }
    throw Error('class has not been registered: ' + component.name || 'unknown')
  }
}

module.exports = ComponentContainer
