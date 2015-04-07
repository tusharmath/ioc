##IOC - Inversion of control
The most ridiculously simple dependency injection module ever!

```js
Injector = require('ioc')

//static function for annotation
annotate = Injector.annotate

function A (){}
A.prototype.print = function (){
    return "World"
}

function B (){}

function C (){}

function Q (){}

//Access base class methods also
Q.prototype.print = function (){
    return "Hello" + Q.__super__.print(); // Hello World
}

annotate(Q)
    .inject(B, C) //Dependcies
    .extends(A) // Inheritence
    .asSingleton //Default: Transient


ioc = new Injector();
ioc.get(Q);
```