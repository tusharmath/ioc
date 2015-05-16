#NODE-IOC - Inversion of control
A version which works only with the latest version of io.js

##Example
A container is a object which holds the relationships between various components and their life cycle. Create a container as follows ~

```js
var IOC = require('node-ioc')
var container = new IOC()
```


##Component Registration
```js
container.registerInstance({}).as(ClassName1)
container.register((c)=> c.resolve(a)).as(ClassName2).singleton()
container.registerType(ClassName1, ClassName2).as(ClassName)
```

##Component Resolution
```js
container.resolve(ClassName)
```

##Features
0. Support for es6 features
0. Support for cyclic dependency
0. Support for Singletons
0. Support for Container as a dependency 
0. Support for custom factory (use *container.register(<lambda>)*)
0. Support for instance (use *container.registerInstance(<Object>)*)
0. Support for class (use *container.registerWithTypes(<class1>, <class2>, <class3> ...)*)
