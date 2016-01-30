/**
 * Created by tusharmathur on 5/9/15.
 */
'use strict'

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

module.exports = ResolutionQueue
