"use strict";
exports.find = function (array, cb) {
    var i, j, len;
    for (j = 0, len = array.length; j < len; j++) {
        i = array[j];
        if (cb(i)) {
            return i;
        }
    }
    return null;
};

exports.assign = function (obj, src) {
    var k, v;
    for (k in src) {
        v = src[k];
        obj[k] = v;
    }
    return obj;
};

exports.map = function (items, cb) {
    var i, j, len, results;
    results = [];
    for (j = 0, len = items.length; j < len; j++) {
        i = items[j];
        results.push(cb(i));
    }
    return results;
};