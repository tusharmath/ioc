"use strict";

var should = require('chai').should();

var expect = require('chai').expect;

var Container = require('../lib/ioc');

describe('Container', function () {
    class A {
    }
    class B extends A {
    }
    class C {
    }
    beforeEach(function () {
        this.container = new Container()
    })
    it('throws as unregisterd', function () {
        expect(function () {
            this.container.resolve(A)
        }.bind(this))
            .to.Throw('class has not been registered')
    })

    it('resolves a class', function () {
        this.container.register(A)
        this.container.resolve(A).should.be.an.instanceOf(A)
    })

    it('resolves with injections', function () {
        class X {
            constructor(a) {
                this.a = a
            }
        }
        this.container.register(A)
        this.container.register(X).inject(A)
        this.container.resolve(X).a.should.be.an.instanceOf(A)
    })
    it('resolves a singleton class', function () {
        class X {
        }
        this.container.register(X).asSingleton()
        var x1 = this.container.resolve(X),
            x2 = this.container.resolve(X)
        x1.should.equal(x2)
    })

});