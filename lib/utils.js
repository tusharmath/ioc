"use strict";
let _ = {};
_.find = function (array, cb) {
    var i, j, len;
    for (j = 0, len = array.length; j < len; j++) {
        i = array[j];
        if (cb(i)) {
            return i;
        }
    }
    return null;
};

_.assign = function (obj, src) {
    var k, v;
    for (k in src) {
        v = src[k];
        obj[k] = v;
    }
    return obj;
};

_.map = function (items, cb) {
    var i, j, len, results;
    results = [];
    this.each(items, i => results.push(cb(i)))
    return results;
};

_.toArray = function (obj) {
    var slice = [].slice;
    return arguments.length >= 1 ? slice.call(obj, 0) : [];
}

_.each = function (items, cb) {
    if (items instanceof Array) {
        for (let i = 0; i < items.length; i++) {
            cb(items[i]);
        }
    }else{
        for(let key in items){
            if(items.hasOwnProperty(key)){
                cb(key, items[key]);
            }
        }
    }
}

_.reduce = function (items, cb, memory) {
    _.each(items,  (item) => memory = cb(memory, item))
}

module.exports = _;