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
        this.container = new Container();
    });
    it('throws as unregisterd', function () {
        expect(function () {
            this.container.resolve(A);
        }.bind(this))
            .to.Throw('class has not been registered');
    });
    describe('registerWithInstance()', function (){
        it('resolves', function () {
            const a = new A();
            this.container.registerWithInstance(a).as(A);
            this.container.resolve(A).should.equal(a);
        });
    });

    describe('register()', function (){
        it('resolves', function () {
            class B{}
            class A{constructor(b){this.b = b}}
            this.container.registerWithInstance(new B).as(B);
            this.container.register(function (c){
                    return new A(c.resolve(B));
            }).as(A);
            var a = this.container.resolve(A);
            a.should.be.an.instanceOf(A);
            a.b.should.be.an.instanceOf(B);
        });
    });
    describe('registerWithType()', function (){
        it('resolves', function () {
            class A{constructor(b){this.b = b}}
            class B{}
            this.container.registerWithInstance(new B).as(B);
            this.container.registerWithTypes(B).as(A);
            this.container.resolve(A).b.should.be.an.instanceOf(B);
        });
    });

    it('handles inheritence', function () {
        class Base {}
        class Child extends Base {}
        this.container.registerWithInstance(new Child(1,2)).as(Child);
        this.container.resolve(Child).should.be.an.instanceOf(Base);
    });
    it('resolves a singleton class', function () {
        class X {}
        this.container.register(function (){
            return new X();
        }).as(X).singleton();
        var x1 = this.container.resolve(X),
            x2 = this.container.resolve(X);
        x1.should.equal(x2)
    });
    it('resolves properties', function () {
        class X {
            constructor () {
                this.a = 'A';
            }
        }
        this.container.register(function(){
                return  new X().a;
        }).as(X);
        this.container.resolve(X).should.equal('A');
    });

    it('handles self dependency', function (){
        class A {
            constructor (c) {
                this.c = c;
            }
        }
        this.container.registerWithTypes(Container).as(A);
        this.container.resolve(A).c.should.equal(this.container);
    });

    it('handles cyclic dependencies', function (){
        class A {}
        class B {}
        this.container.registerWithTypes(A).as(B);
        this.container.registerWithTypes(B).as(A);
        expect(function (){
            this.container.resolve(A)
        }.bind(this)).to.throw('cyclic dependency detected at: A');
    });

});