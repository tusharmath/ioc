var Injector, expect, should;

should = require('chai').should();

expect = require('chai').expect;

Injector = require('../ioc');

describe('Injector', function () {
    beforeEach(function () {
        this.annotate = Injector.annotate;
        this.mod = new Injector;
        this.A = function () {
        };
        return this.B = function () {
        };
    });
    it('should exist', function () {
        return should.exist(Injector);
    });
    describe('get()', function () {
        it('returns an instance of a class', function () {
            return this.mod.get(this.A).should.be.an.instanceOf(this.A);
        });
        it('returns an instance of a class with dependencies', function () {
            var temp2, x;
            temp2 = (function () {
                function temp2(a1, b) {
                    this.a = a1;
                    this.b = b;
                }

                return temp2;

            })();
            this.annotate(temp2).inject(this.A, this.B);
            x = this.mod.get(temp2);
            x.a.should.be.an.instanceOf(this.A);
            return x.b.should.be.an.instanceOf(this.B);
        });
        return it('can not depend on objects', function () {
            var A;
            A = (function () {
                function A() {
                }

                return A;

            })();
            this.annotate(A).inject({});
            return expect((function (_this) {
                return function () {
                    return _this.mod.get(A);
                };
            })(this)).to["throw"]('Constructor expected');
        });
    });
    describe('get().asSingleton()', function () {
        it('returns the same instance of a class', function () {
            this.annotate(this.A).asSingleton();
            return this.mod.get(this.A).should.equal(this.mod.get(this.A));
        });
        return it('returns itself when asked for', function () {
            return this.mod.get(Injector).should.equal(this.mod);
        });
    });
    describe('get().extends()', function () {
        it('supports prototypical inheritance', function () {
            this.annotate(this.A)["extends"](this.B);
            return this.mod.get(this.A).should.be.an.instanceOf(this.B);
        });
        it('supports prototypical inheritance', function () {
            var A, B;
            A = (function () {
                function A() {
                }

                A.prototype.print = function () {
                    return " World";
                };

                return A;

            })();
            B = (function () {
                function B() {
                }

                B.prototype.print = function () {
                    return "Hello" + B.__super__.print.apply(this, arguments);
                };

                return B;

            })();
            this.annotate(B)["extends"](A);
            return this.mod.get(B).print().should.equal("Hello World");
        });
        return it('throws if base class is a singleton', function () {
            var Base, Child1;
            Base = (function () {
                function Base() {
                }

                Base.prototype.print = function () {
                    return "World";
                };

                return Base;

            })();
            Child1 = (function () {
                function Child1() {
                }

                Child1.prototype.print = function () {
                    return "Hello " + Child1.__super__.print.apply(this, arguments);
                };

                return Child1;

            })();
            this.annotate(Base).asSingleton();
            this.annotate(Child1)["extends"](Base);
            return expect((function (_this) {
                return function () {
                    return _this.mod.get(Child1);
                };
            })(this)).to["throw"]("can not instantiate if the class extends a singleton");
        });
    });
    describe('get().resolveAs()', function () {
        it('resolves with the resolver', function () {
            var A, i;
            i = 100;
            A = (function () {
                function A() {
                    this.j = 0;
                }

                A.prototype.create = function () {
                    return [i++, ++this.j];
                };

                return A;

            })();
            this.annotate(A).resolveAs(function (a) {
                return a.create();
            });
            this.mod.get(A).should.deep.equal([100, 1]);
            return this.mod.get(A).should.deep.equal([101, 1]);
        });
        it('resolves singletons with the resolver', function () {
            var A, i;
            i = 100;
            A = (function () {
                function A() {
                    this.j = 0;
                }

                A.prototype.create = function () {
                    return [++i, ++this.j];
                };

                return A;

            })();
            this.annotate(A).asSingleton().resolveAs(function (a) {
                return a.create();
            });
            return this.mod.get(A).should.equal(this.mod.get(A));
        });
        return it('resolveAs callback is called with instance of ioc', function () {
            var A, ioc;
            A = function () {
            };
            ioc = null;
            this.annotate(A).resolveAs(function (a, _ioc) {
                return ioc = _ioc;
            });
            this.mod.get(A);
            return ioc.should.equal(this.mod);
        });
    });
    return describe("get().providerFor()", function () {
        beforeEach(function () {
            this.AMock = function () {
                return this.jupiter = 200;
            };
            this.A = function () {
                return this.jupiter = 100;
            };
            this.annotate(this.AMock).providerFor(this.A);
            return this.mod = new Injector(this.AMock);
        });
        it("provides a mock instance", function () {
            return (this.mod.get(this.A) instanceof this.AMock).should.be.ok;
        });
        return it("supports resolveAs", function () {
            this.annotate(this.A).resolveAs(function (i) {
                return i.jupiter;
            });
            return this.mod.get(this.A).should.equal(200);
        });
    });
});