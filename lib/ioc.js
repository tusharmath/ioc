'use strict'
var _ = require('lodash')
var u = require('./utils')
var ResolutionQueue = require('./ResolutionQueue')
var ComponentContainer = require('./ComponentContainer')

var componentTypeFactory = _.curry(function (components, container, ctor) {
  var resolvedComponents = _.map(components, container.resolve)
  const CtorBound = u.nativeBind(ctor, resolvedComponents)
  return new CtorBound()
})

var createAnnotation = function (factory, compContainer) {
  if (typeof factory !== 'function') {
    throw Error('Factory should be of function type')
  }
  let compDescriptor
  return {
    as: function (component) {
      compDescriptor = compContainer.createDescriptor(component, factory)
      return {
        singleton: function () {
          compDescriptor.isSingleton = true
        }
      }
    }
  }
}

class Container {
  /** Dependency injection module
   * @constructor
   */
  constructor() {
    this.components = new Map()
    this.resolutionQueue = new ResolutionQueue()
    this.componentContainer = new ComponentContainer()
    this.resolve = _.bind(this.resolve, this)
    this.registerWithInstance(this).as(Container)
  }

  /**
   * Creates an instance of the component (component needs to be registered first)
   * @param {class} component - component constructor
   * @returns {object}
   */
  resolve(component) {
    var instance

    // NOTE:Test for cyclic dependencies should start before resolution
    this.resolutionQueue.add(component)

    let componentDescriptor = this.componentContainer.getDescriptor(component)
    if (componentDescriptor.instance) {
      instance = componentDescriptor.instance
    } else {
      instance = componentDescriptor.factory(this, component)
    }

    if (componentDescriptor.isSingleton) {
      componentDescriptor.instance = instance
    }

    // NOTE:resolutionQueue should be cleared just before the return statement
    this.resolutionQueue.remove(component)
    return instance
  }

  /**
   * Register an instance for component resolution
   * @param {object} instance - object that should be used when the component is resolved
   * @return {object}
   */
  registerWithInstance(instance) {
    return createAnnotation(function () {
      return instance
    }, this.componentContainer)
  }

  /**
   * Register via custom factory function
   * @param {function} factory - custom factory
   * @return {{as, singleton}}
   */
  register(factory) {
    return createAnnotation(factory, this.componentContainer)
  }

  /**
   * Register via component constructors with their instances as params
   * @param {...function} components - Components
   */
  registerWithTypes() {
    var components = [].slice.call(arguments, 0, arguments.length)
    return createAnnotation(componentTypeFactory(components), this.componentContainer)
  }

}
module.exports = Container
