'use strict'

class ComponentDescriptor {
  constructor(ctor, factory) {
    this.ctor = ctor
    this.isSingleton = false
    this.factory = factory
    this._instance = null
  }
  set instance(value) {
    this._instance = value
  }
  get instance() {
    return this._instance
  }
}
module.exports = ComponentDescriptor
