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
annotationKey = "__annotations__"
annotate = (ctor) ->
    ctor[annotationKey] = {}

    annotations =
        asSingleton: ->
            ctor[annotationKey].$singleton = true
            @
        extends: (baseClass) ->
            ctor[annotationKey].$extends = baseClass
            @
        inject: (args...) ->
            ctor[annotationKey].$inject = args
            @
isAnnotated = (ctor, annotation) ->
    ctor[annotationKey]?[annotation]

class Injector
    constructor: ->
        @_singletons = []
    _getFromCache: (classCtor) ->
        return null if not isAnnotated classCtor, '$singleton'
        _find @_singletons, (i) -> i instanceof classCtor
    _createInstances: (ctorList) ->
        _map ctorList, (i) => this.get i
    _resolvePrototype: (classCtor) ->

        protoTemp = _assign classCtor::, {}
        if isAnnotated classCtor, '$extends'
            baseClass = @get classCtor[annotationKey].$extends
            classCtor:: = baseClass
            classCtor.__super__ = {}
            _assign classCtor[annotationKey].$extends::, classCtor.__super__

        _assign protoTemp, classCtor::

    _resolveWithArgs: (classCtor, args) ->
        class Ctor
            constructor: (args...) -> classCtor.apply @, args
        Ctor:: = @_resolvePrototype classCtor
        args.unshift null
        _ctor = _bind.apply Ctor, args
        new _ctor
    get: (classCtor) ->
        depMap = [];

        # Is self
        return this if classCtor is Injector

        # Try From cache
        return instance if instance = @_getFromCache classCtor

        # Create Dependency Map
        if isAnnotated classCtor, '$inject'
            depMap = @_createInstances classCtor[annotationKey].$inject
        instance = @_resolveWithArgs classCtor, depMap

        # Add to singleton cache
        if isAnnotated classCtor, '$singleton'
            @_singletons.push instance
        instance;

Injector.annotate = annotate
module.exports = Injector