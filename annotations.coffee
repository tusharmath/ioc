class SingletonAnnotation
SingletonAnnotation.A_KEY = '$lifeCycle'
class TransientAnnotation
TransientAnnotation.A_KEY = '$lifeCycle'
class ExtendsAnnotation
    constructor: (@baseClass) ->
ExtendsAnnotation.A_KEY = '$extends'
class InjectAnnotation
    constructor: (@deps) ->
InjectAnnotation.A_KEY = '$inject'
class ResolveAsAnnotation
    constructor: (@callback) ->
ResolveAsAnnotation.A_KEY = '$resolveAs'
class ProviderAnnotation
    constructor: (@classCtor) ->
ProviderAnnotation.A_KEY = '$providerFor'

class AnnotatedClass
    A_KEY = AnnotatedClass.A_KEY = "__annotations__"
    AC = AnnotatedClass
    constructor: (@classCtor) ->
        @classCtor[A_KEY] = @annotations = {}
    # Chained
    asSingleton: ->
        @annotations[SingletonAnnotation.A_KEY] = new SingletonAnnotation
        @
    asTransient: ->
        @annotations[TransientAnnotation.A_KEY] = new TransientAnnotation
        @
    extends: (baseClass) ->
        @annotations[ExtendsAnnotation.A_KEY] = new ExtendsAnnotation baseClass
        @
    inject: (args...) ->
        @annotations[InjectAnnotation.A_KEY] = new InjectAnnotation args
        @
    resolveAs: (cb) ->
        @annotations[ResolveAsAnnotation.A_KEY] = new ResolveAsAnnotation cb
        @
    providerFor: (providerFor) ->
        @annotations[ProviderAnnotation.A_KEY] = new ProviderAnnotation providerFor
        @
    # $extends
    AC.isExtension = (classCtor) ->
        AC.isAnnotated classCtor, ExtendsAnnotation
    AC.getParent = (classCtor) ->
        annotation = AC.getAnnotation(classCtor, ExtendsAnnotation)
        return annotation.baseClass if annotation
        null


    # $inject
    AC.isDependent = (classCtor) ->
        AC.isAnnotated classCtor, InjectAnnotation
    AC.getDependencies = (classCtor) ->
        annotation = AC.getAnnotation(classCtor, InjectAnnotation)
        return annotation.deps if annotation
        null


    # $singleton
    AC.isSingleton = (classCtor) ->
        AC.isAnnotated classCtor, SingletonAnnotation

    AC.getProviderFor = (classCtor) ->
        annotation = AC.getAnnotation(classCtor, ProviderAnnotation)
        return annotation.classCtor if annotation
        null

    # Static
    AC.isAnnotated = (ctor, annotation) ->
        hasAnnotation = ctor[A_KEY]?[annotation.A_KEY]
        hasAnnotation and hasAnnotation instanceof annotation
    AC.getAnnotation = (ctor, annotation) ->
        if AC.isAnnotated.apply null, arguments
            return ctor[A_KEY][annotation.A_KEY]
        return null

module.exports = {
    SingletonAnnotation
    TransientAnnotation
    ExtendsAnnotation
    InjectAnnotation
    AnnotatedClass
    ResolveAsAnnotation
    ProviderAnnotation
}
