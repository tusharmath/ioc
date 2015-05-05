"use strict";
var getAnnotationKey,
    slice = [].slice;

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
        this.deps = 1 <= arguments.length ? slice.call(arguments, 0) : [];
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

let ANNOTATIONS = {
    'asSingleton': SingletonAnnotation,
    'asTransient': TransientAnnotation,
    'extends': ExtendsAnnotation,
    'inject': InjectAnnotation,
    'resolveAs': ResolveAsAnnotation,
    'providerFor': ProviderAnnotation
};

getAnnotationKey = function (ann) {
    var k, v;
    for (k in ANNOTATIONS) {
        v = ANNOTATIONS[k];
        if (v === ann) {
            return k;
        }
    }
    return null;
};

class AnnotatedClass {
    constructor(classCtor1) {
        this.classCtor = classCtor1;
        this.classCtor[A_KEY] = this.annotations = {};
        this._create(ANNOTATIONS);
    }

    _applyAnnotation(ann, args) {
        var _ann, aKey;
        if (args == null) {
            args = [];
        }
        args.unshift(null);
        _ann = ann.bind.apply(ann, args);
        aKey = getAnnotationKey(ann);
        this.annotations[aKey] = new _ann;
        return this;
    }

    _createAnnotationFunction(annotationName, annotationValue) {
        return (function (_this) {
            return function () {
                var args;
                args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                return _this._applyAnnotation(ANNOTATIONS[annotationName], args);
            };
        })(this);
    }

    _create(annotations) {
        let results;
        results = [];
        for (let annotationName in annotations) {
            let annotationValue = annotations[annotationName];
            let annotationFunction = this._createAnnotationFunction(annotationName, annotationValue);
            results.push(this[annotationName] = annotationFunction);
        }
        return results;
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

