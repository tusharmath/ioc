should = require('chai').should()
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
