'use strict'
var _ = require('lodash')
let utils = {
  nativeBind: function (ctor, args) {
    args.unshift(null)
    return Function.prototype.bind.apply(ctor, args)
  }
}

module.exports = utils
