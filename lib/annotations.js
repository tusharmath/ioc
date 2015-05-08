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
let ANNOTATIONS = {
    'asSingleton': SingletonAnnotation,
    'asTransient': TransientAnnotation,
    'extends': ExtendsAnnotation,
    'inject': InjectAnnotation,
    'resolveAs': ResolveAsAnnotation,
    'providerFor': ProviderAnnotation
};

var getAnnotationKey = function (ann) {
    return _.find(ANNOTATIONS, (v, k) => v === ann);
};

var getAnnotation = function (annotationName) {
    return ANNOTATIONS[annotationName];
};
function createAnnotationFunction (annotationName, annotationValue){
    return function () {
        let argArray = _.toArray(arguments);
        let annotation = getAnnotation(annotationName);
        return this._applyAnnotation(annotation, argArray);
    }.bind(this);
}

var bindAnnotation = function (ann, args) {
    var _ann = Function.prototype.bind.apply(ann, args);
    //var poop = _.spread(ann);
    //var c = new poop(args);
    var aKey = getAnnotationKey(ann);
    this.annotations[aKey] = new _ann;
};

var applyAnnotation = function (args, ann) {
    args = args || [];
    args.unshift(null);
    bindAnnotation.call(this, ann, args);
    return this;
};

var createAnnotations = function (annotations) {
    return _.reduce(annotations, function (m, v, k) {
        m[k] = createAnnotationFunction.call(this, k, v, this);
        return m;
    }, new Map(), this);
};
class AnnotatedClass {
    constructor(classCtor1) {
        this.classCtor = classCtor1;
        this.classCtor[A_KEY] = this.annotations = new Map();
        this._create(ANNOTATIONS);
    }

    _applyAnnotation(ann, args) {
        return applyAnnotation.call(this, args, ann);
    }


    _create(annotations) {
        _.assign(this, createAnnotations.call(this, annotations));
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

