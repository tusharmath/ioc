ANNOTATIONS = {
	'asSingleton': SingletonAnnotation =  ->
	'asTransient': TransientAnnotation = ->
	'extends': ExtendsAnnotation = (@baseClass) ->
	'inject': InjectAnnotation = (@deps...) ->
	'resolveAs': ResolveAsAnnotation = (@callback) ->
	'providerFor': ProviderAnnotation = (@classCtor) ->
}


getAnnotationKey = (ann) ->
	for k, v of ANNOTATIONS
		if v is ann
			return k
	return null

class AnnotatedClass
	A_KEY = AnnotatedClass.A_KEY = "__annotations__"
	AC = AnnotatedClass
	constructor: (@classCtor) ->
		@classCtor[A_KEY] = @annotations = {}
		@_create ANNOTATIONS
	# Chained
	_applyAnnotation: (ann, args = []) ->
		args.unshift null
		_ann = ann.bind.apply ann, args
		aKey = getAnnotationKey ann
		@annotations[aKey] = new _ann
		@
	_createAnnotationFunction: (annotationName, annotationValue) ->
		(args...) => @_applyAnnotation ANNOTATIONS[annotationName], args
	_create: (annotations) ->
		for annotationName, annotationValue of annotations
			@[annotationName] = @_createAnnotationFunction annotationName, annotationValue


	# Helper Methods
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
		hasAnnotation = ctor[A_KEY]?[getAnnotationKey(annotation)]
		hasAnnotation and hasAnnotation instanceof annotation
	AC.getAnnotation = (ctor, annotation) ->
		if AC.isAnnotated.apply null, arguments
			return ctor[A_KEY][getAnnotationKey(annotation)]
		return null

module.exports = AnnotatedClass
