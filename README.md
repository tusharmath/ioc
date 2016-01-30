# NODE-IOC - Inversion of control [![Travis](https://img.shields.io/travis/tusharmath/ioc.svg)](https://travis-ci.org/tusharmath/ioc) [![npm](https://img.shields.io/npm/v/node-ioc.svg)](https://www.npmjs.com/package/node-ioc)


## Example
A container is a object which holds the relationships between various components and their life cycle. Create a container as follows ~

```js
var Container = require('node-ioc')
var container = new Container()
```

## Component Registration
Once a `container` is created we must register all the components and their factories. Registration is an important part of dependency injection and should all be at one place. So whenever there is a change in the component dependencies, or your container itself, you can just change it here.

### API
- `registerInstance`: Registers a value for a class. So whenever that class is being resolved, that value would be provided instead.

  ```javascript
  class jQuery {}
  container.registerInstance(window.$).as(jQuery)

  container.resolve(jQuery) === window.$ // true
  ```

- `registerType`: This would be the most common use case, where a single class depends on multiple classes. In the following case if you try to resolve `SampleClass0`, the container will instantiate `SampleClass1` and `SampleClass2` and then provide their instances to the constructor of `SampleClass0`.

  ```javascript
  class SampleClass0{
    constructor (sc1, sc2){
      this.sc1 = sc1
      this.sc2 = sc2
    }
  }
  class SampleClass1{}
  class SampleClass2{}

  container.registerType(SampleClass1, SampleClass2).as(SampleClass0)

  const sc0 = container.resolve(SampleClass0)
  sc0.sc1 instanceof SampleClass1 // true
  sc0.sc2 instanceof SampleClass2 // true

  ```

- `register`: This allows you to create a custom factory. Sometimes `registerType` and `registerInstance` are just not good enough. For instance —

  ```js
  class CurrentDate {}
  class SampleClass {
    constructor (date) {
      console.log(date)
    }
  }
  container.register(() => new Date()).as(CurrentDate)
  container.registerType(CurrentDate).as(SampleClass)
  container.resolve(SampleClass) // Sat Jan 30 2016 12:57:29 GMT+0530 (IST)

  ```
  The `register` function's first param is the current instance of the container.


- `singleton`: This implements the standard singleton pattern.

  ```javascript
  class SampleClass {}
  container.register(new SampleClass()).as(SampleClass).singleton()

  const s0 = container.resolve(SampleClass)
  const s1 = container.resolve(SampleClass)
  s0 === s1 // true
  ```

## Salient Features
0. Detection for cyclic dependency
0. Support for Container as a dependency using `registerWithTypes`
  ```javascript
  class SampleClass {}
  container.registerWithTypes(Container).as(SampleClass)

  ```
  In this case the current instance of `Container` will be passed as the first argument to the constructor of the `SampleClass`
