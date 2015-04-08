class Injector
    constructor: ->
        @_singletons = []

    # Private Functions
    _bind = Function.prototype.bind
    _each = (arr, callback, ctx) ->
        callback.call ctx, i for i in arr
    _find = (arr, callback, ctx) ->
        validItem = null;
        _each arr, (i) -> validItem = i if callback.call ctx, i
        validItem
    _map = (arr, callback, ctx) ->
        callback.call ctx, i for i in arr
    _assign = (baseObj, finalObj) ->
        keys = Object.keys baseObj
        _each keys, (k) -> finalObj[k] = baseObj[k]
        finalObj
    A_KEY = "__annotations__"
    isAnnotated = (ctor, annotation) ->
        ctor[A_KEY]?[annotation]
    _resolvePrototype = (classCtor, baseClass) ->
        protoTemp = _assign classCtor::, {}
        if isAnnotated classCtor, '$extends'
            classCtor:: = baseClass
            classCtor.__super__ = {}
            _assign classCtor[A_KEY].$extends::, classCtor.__super__
        _assign protoTemp, classCtor::
    _resolve = (classCtor, args, baseClass) ->
        class Ctor
            constructor: (args...) -> classCtor.apply @, args
        Ctor:: = _resolvePrototype classCtor, baseClass
        args.unshift null
        _ctor = _bind.apply Ctor, args
        new _ctor
    _getFromCache: (classCtor) ->
        return null if not isAnnotated classCtor, '$singleton'
        _find @_singletons, (i) -> i instanceof classCtor
    _getBaseClass: (baseClass) ->
        @get classCtor[A_KEY].$extends
    # Static annotation
    Injector.annotate = annotate = (ctor) ->
        ctor[A_KEY] = {}

        annotations =
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
            depMap = _map classCtor[A_KEY].$inject, (i) => @get i

        # Get Base class instance
        if isAnnotated classCtor, '$extends'
            baseClass = @get classCtor[A_KEY].$extends

        # Resolve Instance
        instance = _resolve classCtor, depMap, baseClass

        # Add to singleton cache
        if isAnnotated classCtor, '$singleton'
            @_singletons.push instance
        instance;

module.exports = Injector
