_ = require 'lodash'
{AnnotatedClass} = require './annotations'
class Injector
    constructor: ->
        @_singletons = []

    # Private Functions
    _bind = Function.prototype.bind
    A_KEY = AnnotatedClass.A_KEY
    AC = AnnotatedClass

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
    _getFromCache: (classCtor) ->
        return null if not AC.isSingleton classCtor
        _.find @_singletons, (i) -> i instanceof classCtor
    _getBaseClass: (baseClass) ->
        baseExtension = AC.getParent classCtor
        @get baseExtension
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
            baseExtension = AC.getParent classCtor
            baseClass = @get baseExtension

        # Resolve Instance
        instance = _resolve classCtor, depMap, baseClass

        # Add to singleton cache
        if AC.isSingleton classCtor
            @_singletons.push instance
        instance;

module.exports = Injector
