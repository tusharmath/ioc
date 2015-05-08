"use strict";
let _ = require('lodash');

class SingletonAnnotation {
}
class TransientAnnotation {
}
class ExtendsAnnotation {
    constructor(baseClass) {
        this.baseClass = baseClass;
    }
}
class InjectAnnotation {
    constructor() {
        this.deps = _.toArray(arguments);
    }
}

class ResolveAsAnnotation {
    constructor(callback) {
        this.callback = callback;
    }
}

class ProviderAnnotation {
    constructor(classCtor) {
        this.classCtor = classCtor;
    }
}

//TODO: Redundant
const ANNOTATIONS = {
    'asSingleton': SingletonAnnotation,
    'asTransient': TransientAnnotation,
    'extends': ExtendsAnnotation,
    'inject': InjectAnnotation,
    'resolveAs': ResolveAsAnnotation,
    'providerFor': ProviderAnnotation
};

const getAnnotationKey = function (ann) {
    return _.find(_.keys(ANNOTATIONS), k => ANNOTATIONS[k] === ann)
};

const getAnnotation = function (annotationName) {
    return ANNOTATIONS[annotationName];
};

const annotationReducer = function (annotationInstances, annotationValue, annotationName) {
    annotationInstances[annotationName] = function () {
        let argArray = _.toArray(arguments);
        argArray.unshift(null);
        var _ann = Function.prototype.bind.apply(annotationValue, argArray);
        this.annotations[annotationName] = new _ann;
        return this
    }
    return annotationInstances;
};


class AnnotatedClass {
    constructor(classCtor) {
        this.classCtor = classCtor;
        this.classCtor[A_KEY] = this.annotations = {};
        _.assign(this, _.reduce(ANNOTATIONS, annotationReducer, {}) );
    }
}

let A_KEY = AnnotatedClass.A_KEY = "__annotations__";

AnnotatedClass.isExtension = function (classCtor) {
    return AnnotatedClass.isAnnotated(classCtor, ExtendsAnnotation);
};

AnnotatedClass.getParent = function (classCtor) {
    var annotation;
    annotation = AnnotatedClass.getAnnotation(classCtor, ExtendsAnnotation);
    if (annotation) {
        return annotation.baseClass;
    }
    return null;
};

AnnotatedClass.isDependent = function (classCtor) {
    return AnnotatedClass.isAnnotated(classCtor, InjectAnnotation);
};

AnnotatedClass.getDependencies = function (classCtor) {
    var annotation;
    annotation = AnnotatedClass.getAnnotation(classCtor, InjectAnnotation);
    if (annotation) {
        return annotation.deps;
    }
    return null;
};

AnnotatedClass.isSingleton = function (classCtor) {
    return AnnotatedClass.isAnnotated(classCtor, SingletonAnnotation);
};

AnnotatedClass.getProviderFor = function (classCtor) {
    var annotation;
    annotation = AnnotatedClass.getAnnotation(classCtor, ProviderAnnotation);
    if (annotation) {
        return annotation.classCtor;
    }
    return null;
};

AnnotatedClass.getResolution = function (classCtor) {
    var annotation;
    annotation = AnnotatedClass.getAnnotation(classCtor, ResolveAsAnnotation);
    if (annotation) {
        return annotation.callback;
    }
    return null;
};

AnnotatedClass.isAnnotated = function (ctor, annotation) {
    var hasAnnotation, ref;
    hasAnnotation = (ref = ctor[A_KEY]) != null ? ref[getAnnotationKey(annotation)] : void 0;
    return hasAnnotation && hasAnnotation instanceof annotation;
};

AnnotatedClass.getAnnotation = function (ctor, annotation) {
    if (AnnotatedClass.isAnnotated.apply(null, arguments)) {
        return ctor[A_KEY][getAnnotationKey(annotation)];
    }
    return null;
};
module.exports = AnnotatedClass;

