should = require('chai').should()
Injector = require '../ioc'
describe 'Injector', ->
	beforeEach ->
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
			temp2.$inject = [@A, @B]
			x = @mod.get temp2
			x.a.should.be.an.instanceOf @A
			x.b.should.be.an.instanceOf @B
		it 'returns an instance of a class', ->
			@A.$singleton = true
			@mod.get(@A).should.equal @mod.get(@A)
		it 'returns itself when asked for', ->
			@mod.get(Injector).should.equal @mod
		# it 'supports prototypical inheritance', ->
		# 	@A.$extends = @B
		# 	@mod.get(@A).should.be.an.instanceOf @B
