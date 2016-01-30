'use strict'

const test = require('ava')
const Container = require('../lib/ioc')

test('throws as unregisterd', t => {
  const container = new Container()
  class A {
  }
  t.throws(() => container.resolve(A), 'class has not been registered: A')
})

test('registerWithInstance()', t => {
  const container = new Container()
  class A {
  }
  const a = 10000
  container.registerWithInstance(a).as(A)
  t.is(container.resolve(A), a)
})

test('register()', t => {
  const container = new Container()
  class B {
  }
  class A {
    constructor(b) {
      this.b = b
    }
  }
  container.registerWithInstance(new B()).as(B)
  container.register(function (c) {
    return new A(c.resolve(B))
  }).as(A)
  const a = container.resolve(A)
  t.true(a instanceof A)
  t.true(a.b instanceof B)
})

test('registerWithType()', t => {
  const container = new Container()
  class A {
    constructor(b) {this.b = b}
  }
  class B {
  }
  container.registerWithInstance(new B).as(B)
  container.registerWithTypes(B).as(A)
  t.true(container.resolve(A).b instanceof B)
})

test('handles inheritence', t => {
  const container = new Container()
  class Base {
  }
  class Child extends Base {
  }
  container.registerWithInstance(new Child(1, 2)).as(Child)
  t.true(container.resolve(Child) instanceof Base)
})

test('resolves a singleton class', t => {
  const container = new Container()
  class X {
  }
  container.register(function () {
    return new X()
  }).as(X).singleton()
  const x1 = container.resolve(X)
  const x2 = container.resolve(X)
  t.is(x1, x2)
})

test('resolves properties', t => {
  const container = new Container()
  class X {
    constructor() {
      this.a = 'A'
    }
  }
  container.register(function () {
    return new X().a
  }).as(X)
  t.is(container.resolve(X), 'A')
})

test('handles self dependency', t => {
  const container = new Container()
  class A {
    constructor(c) {
      this.c = c
    }
  }
  container.registerWithTypes(Container).as(A)
  t.is(container.resolve(A).c, container)
})

test('handles cyclic dependencies', t => {
  const container = new Container()
  class A {
  }
  class B {
  }
  container.registerWithTypes(A).as(B)
  container.registerWithTypes(B).as(A)
  t.throws(() => container.resolve(A), 'cyclic dependency detected at: A')
})
