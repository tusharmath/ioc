_ = require 'lodash'
class Injector
    constructor: ->
        @_singletons = []

    # Private Functions
    _bind = Function.prototype.bind
    A_KEY = "__annotations__"
    isAnnotated = (ctor, annotation) ->
        ctor[A_KEY]?[annotation]
    _resolvePrototype = (classCtor, baseClass) ->
        protoTemp = _.assign {}, classCtor::
        if isAnnotated classCtor, '$extends'
            classCtor:: = baseClass
            classCtor.__super__ = {}
            _.assign classCtor.__super__, classCtor[A_KEY].$extends::
        _.assign classCtor::, protoTemp
    _resolve = (classCtor, args, baseClass) ->
        class Ctor
            constructor: (args...) -> classCtor.apply @, args
        Ctor:: = _resolvePrototype classCtor, baseClass
        args.unshift null
        _ctor = _bind.apply Ctor, args
        new _ctor
    _getFromCache: (classCtor) ->
        return null if not isAnnotated classCtor, '$singleton'
        _.find @_singletons, (i) -> i instanceof classCtor
    _getBaseClass: (baseClass) ->
        @get classCtor[A_KEY].$extends
    # Static annotation
    Injector.annotate = annotate = (ctor) ->
        ctor[A_KEY] = {}

        annotations =
            asTransient: ->
                ctor[A_KEY].$singleton = false
                @
            asSingleton: ->
                ctor[A_KEY].$singleton = true
                @
            extends: (baseClass) ->
                ctor[A_KEY].$extends = baseClass
                @
            inject: (args...) ->
                ctor[A_KEY].$inject = args
                @

    get: (classCtor) ->
        depMap = [];

        # Is self
        return this if classCtor is Injector

        # Try From cache
        return instance if instance = @_getFromCache classCtor

        # Create Dependency Map
        if isAnnotated classCtor, '$inject'
            depMap = _.map classCtor[A_KEY].$inject, (i) => @get i

        # Get Base class instance
        if isAnnotated classCtor, '$extends'
            if isAnnotated classCtor[A_KEY].$extends, '$singleton'
                throw new Error "can not instantiate if the class extends a singleton"
            baseClass = @get classCtor[A_KEY].$extends

        # Resolve Instance
        instance = _resolve classCtor, depMap, baseClass

        # Add to singleton cache
        if isAnnotated classCtor, '$singleton'
            @_singletons.push instance
        instance;

module.exports = Injector
