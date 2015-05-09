"use strict";
var _ = require('lodash')
let utils = {
    bindFunction: function (ctor, args) {
        args.unshift(null)
        return Function.prototype.bind.apply(ctor, args)
    },

    bindAllKeys: function (obj, context) {
        _.each(obj, (v, k) => obj[k] = v.bind(context))
    }

}

module.exports = utils