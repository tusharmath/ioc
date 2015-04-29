class SingletonAnnotation
	A_KEY: 'asSingleton'

class TransientAnnotation
	A_KEY: 'asTransient'

class ExtendsAnnotation
	constructor: (@baseClass) ->
	A_KEY: 'extends'

class InjectAnnotation
	constructor: (@deps...) ->
	A_KEY: 'inject'

class ResolveAsAnnotation
	constructor: (@callback) ->
	A_KEY: 'resolveAs'

class ProviderAnnotation
	constructor: (@classCtor) ->
	A_KEY: 'providerFor'

class AnnotatedClass
	A_KEY = AnnotatedClass.A_KEY = "__annotations__"
	AC = AnnotatedClass
	constructor: (@classCtor) ->
		@classCtor[A_KEY] = @annotations = {}

	# Chained
	_applyAnnotation: (ann, args = []) ->
		args.unshift null
		_ann = ann.bind.apply ann, args
		@annotations[ann::A_KEY] = new _ann
		@
	# TODO:Unused but usable
	_create: (annotations) ->
		for ann in annotations
			@[ann::A_KEY] = (args...) =>
				@_applyAnnotation ann, args
	# TODO: Refactor
	asSingleton: -> @_applyAnnotation SingletonAnnotation
	asTransient: -> @_applyAnnotation TransientAnnotation
	extends: (args...) -> @_applyAnnotation ExtendsAnnotation, args
	inject: (args...) -> @_applyAnnotation InjectAnnotation, args
	resolveAs: (args...) -> @_applyAnnotation ResolveAsAnnotation, args
	providerFor: (args...) -> @_applyAnnotation ProviderAnnotation, args

	# $extends
	AC.isExtension = (classCtor) ->
		AC.isAnnotated classCtor, ExtendsAnnotation
	AC.getParent = (classCtor) ->
		annotation = AC.getAnnotation(classCtor, ExtendsAnnotation)
		return annotation.baseClass if annotation
		null
	AC.isDependent = (classCtor) ->
		AC.isAnnotated classCtor, InjectAnnotation
	AC.getDependencies = (classCtor) ->
		annotation = AC.getAnnotation(classCtor, InjectAnnotation)
		return annotation.deps if annotation
		null
	AC.isSingleton = (classCtor) ->
		AC.isAnnotated classCtor, SingletonAnnotation
	AC.getProviderFor = (classCtor) ->
		annotation = AC.getAnnotation(classCtor, ProviderAnnotation)
		return annotation.classCtor if annotation
		null
	AC.getResolution = (classCtor) ->
		annotation = AC.getAnnotation(classCtor, ResolveAsAnnotation)
		return annotation.callback if annotation
		null

	AC.isAnnotated = (ctor, annotation) ->
		hasAnnotation = ctor[A_KEY]?[annotation::A_KEY]
		hasAnnotation and hasAnnotation instanceof annotation
	AC.getAnnotation = (ctor, annotation) ->
		if AC.isAnnotated.apply null, arguments
			return ctor[A_KEY][annotation::A_KEY]
		return null

module.exports = AnnotatedClass
