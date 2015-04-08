#NODE-IOC - Inversion of control
Heavly inspired by [angular/di.js](https://github.com/angular/di.js).

##Advantages
- A ridiculously simple dependency injection module, perfect for unit-testing.
- Not making you move away from the default `require` feature of nodejs.
- Supports inheritence ie. base classes will automatically be injected into the prototype at the time of instantiations.
- No need for registering modules. Auto detects dependencies using annotations.

```js
Injector = require('node-ioc')

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
    return "Hello" + Q.__super__.print(); // Hello World, works best with coffeescript
}

annotate(Q)
    .inject(B, C) //Dependcies
    .extends(A) // Inheritence
    .resolveAs(function(q){
        //q: instance of Q
        //Really powerful when you want to do something everytime its required
    })
    .asSingleton() //Default: Transient


ioc = new Injector();
ioc.provideFor(Q, {a: 100}); //Useful for mocking classes
var q = ioc.get(Q); //Instantiate Q
```
Want more? Create a ticket :)