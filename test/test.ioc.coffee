should = require('chai').should()
expect = require('chai').expect
Injector = require '../ioc'
describe 'Injector', ->
	beforeEach ->
		{@annotate} = Injector
		@mod = new Injector
		@A = ->
		@B = ->
	it 'should exist', ->
		should.exist Injector
	describe 'get()', ->
		it 'returns an instance of a class', ->
			@mod.get(@A).should.be.an.instanceOf @A
		it 'returns an instance of a class with dependencies', ->
			class temp2
				constructor: (@a, @b) ->
			@annotate(temp2).inject @A, @B
			x = @mod.get temp2
			x.a.should.be.an.instanceOf @A
			x.b.should.be.an.instanceOf @B
		it 'returns the same instance of a class', ->
			@annotate(@A).asSingleton()
			@mod.get(@A).should.equal @mod.get(@A)
		it 'returns itself when asked for', ->
			@mod.get(Injector).should.equal @mod
		it 'supports prototypical inheritance', ->
			@annotate(@A).extends @B
			@mod.get(@A).should.be.an.instanceOf @B
		it 'supports prototypical inheritance', ->
			class A
				print: -> " World"
			class B
				print: ->
					"Hello" + super

			@annotate(B).extends A
			@mod.get(B).print().should.equal "Hello World"
		it 'throws if base class is a singleton', ->
			class Base
				print: -> "World"
			class Child1
				print: ->
					"Hello " + super
			@annotate(Base).asSingleton()
			@annotate(Child1).extends Base

			expect => @mod.get(Child1)
			.to.throw "can not instantiate if the class extends a singleton"
		it 'resolves with the resolver', ->
			i = 100
			class A
				constructor: -> @j = 0
				create: -> [i++, @j++]
			@annotate A
			.resolveAs (a) -> a.create()

			@mod.get A
			.should.deep.equal [100, 0]
			@mod.get A
			.should.deep.equal [101, 0]
		it 'resolves singletons with the resolver', ->
			i = 100
			class A
				constructor: -> @j = 0
				create: -> [i++, @j++]
			@annotate A
			.asSingleton()
			.resolveAs (a) -> a.create()

			@mod.get A
			.should.deep.equal [100, 0]
			@mod.get A
			.should.deep.equal [101, 1]