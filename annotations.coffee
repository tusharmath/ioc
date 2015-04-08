_ = require 'lodash'
class SingletonAnnotation
class TransientAnnotation
class ExtendsAnnotation
    constructor: (@baseClass) ->
class InjectAnnotation
    constructor: (@args) ->

class AnnotatedClass
    A_KEY = AnnotatedClass.A_KEY = "__annotations__"
    constructor: (@classCtor) ->
        @classCtor[A_KEY] = @annotations = {}
    # isSingleton: -> @annotations.$singleton
    # hasParent: -> @annotations.$extends isnt null
    # getInject

    # Chained
    asSingleton: ->
        @annotations.$singleton = true
        @
    asTransient: ->
        @annotations.$singleton = false
        @
    extends: (baseClass) ->
        @annotations.$extends = baseClass
        @
    inject: (args...) ->
        @annotations.$inject = args
        @

    # $extends
    AnnotatedClass.isExtension = (classCtor) -> AnnotatedClass.isAnnotated classCtor, '$extends'
    AnnotatedClass.getParent = (classCtor) -> AnnotatedClass.getAnnotation classCtor, '$extends'

    # $inject
    AnnotatedClass.isDependent = (classCtor) -> AnnotatedClass.isAnnotated classCtor, '$inject'
    AnnotatedClass.getDependencies = (classCtor) -> AnnotatedClass.getAnnotation classCtor, '$inject'

    # $singleton
    AnnotatedClass.isSingleton = (classCtor) -> AnnotatedClass.isAnnotated classCtor, '$singleton'

    # Static
    AnnotatedClass.isAnnotated = (ctor, annotation) -> ctor[A_KEY]?[annotation]
    AnnotatedClass.getAnnotation = (ctor, annotation) -> ctor[A_KEY][annotation]

module.exports = {
    SingletonAnnotation
    TransientAnnotation
    ExtendsAnnotation
    InjectAnnotation
    AnnotatedClass
}