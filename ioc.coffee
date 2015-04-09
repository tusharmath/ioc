_ = require './utils.coffee'

{
    ResolveAsAnnotation
    AnnotatedClass
    ExtendsAnnotation
} = require './annotations.coffee'



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

_resolveAs = (classCtor, instance) ->
    if AC.isAnnotated classCtor, ResolveAsAnnotation
        annotation = AC.getAnnotation classCtor, ResolveAsAnnotation
        return annotation.callback instance
    instance

class Injector
    constructor: ->
        @_singletons = []
        @_mocks = []

    _getFromCache: (classCtor) ->
        return null if not AC.isSingleton classCtor
        _.find @_singletons, (i) -> i instanceof classCtor
    # Static annotation
    Injector.annotate = annotate = (ctor) ->
        new AnnotatedClass ctor

    _getFromMock: (classCtor) ->
        _.find @_mocks, (i) -> classCtor is i.classCtor
    providerFor: (classCtor, instance) ->
        @_mocks.push {classCtor, instance}
        @

    get: (classCtor) ->
        if mock = @_getFromMock classCtor
            return mock.instance

        depMap = [];

        # Is self
        return this if classCtor is Injector

        # Try From cache
        if instance = @_getFromCache classCtor
            return _resolveAs classCtor, instance

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

        instance = _resolveAs classCtor, instance
        instance

module.exports = Injector
