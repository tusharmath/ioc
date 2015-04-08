_ = require 'lodash'
{AnnotatedClass, ExtendsAnnotation} = require './annotations'
A_KEY = AnnotatedClass.A_KEY
AC = AnnotatedClass

# Private Functions
_bind = Function.prototype.bind


_resolvePrototype = (classCtor, baseClass) ->
    protoTemp = _.assign {}, classCtor::
    if AC.isExtension classCtor
        classCtor:: = baseClass
        classCtor.__super__ = {}
        baseExtension = AC.getParent classCtor
        _.assign classCtor.__super__, baseExtension::
    _.assign classCtor::, protoTemp


_resolve = (classCtor, args, baseClass) ->
    class Ctor
        constructor: (args...) -> classCtor.apply @, args
    Ctor:: = _resolvePrototype classCtor, baseClass
    args.unshift null
    _ctor = _bind.apply Ctor, args
    new _ctor


class Injector
    constructor: ->
        @_singletons = []

    _getFromCache: (classCtor) ->
        return null if not AC.isSingleton classCtor
        _.find @_singletons, (i) -> i instanceof classCtor
    # Static annotation
    Injector.annotate = annotate = (ctor) ->
        ctor[A_KEY] = {}
        new AnnotatedClass ctor

    get: (classCtor) ->
        depMap = [];

        # Is self
        return this if classCtor is Injector

        # Try From cache
        return instance if instance = @_getFromCache classCtor

        # Create Dependency Map
        if AC.isDependent classCtor
            depMap = _.map AC.getDependencies(classCtor), (i) => @get i

        # Get Base class instance
        if AC.isExtension classCtor
            baseExtension = AC.getParent classCtor
            if AC.isSingleton baseExtension
                throw new Error "can not instantiate if the class extends a singleton"
            baseClass = @get AC.getParent classCtor

        # Resolve Instance
        instance = _resolve classCtor, depMap, baseClass

        # Add to singleton cache
        if AC.isSingleton classCtor
            @_singletons.push instance
        instance;

module.exports = Injector
