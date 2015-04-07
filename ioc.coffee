_bind = Function.prototype.bind
_each = (arr, callback, ctx) ->
    callback.call ctx, i for i in arr

_find = (arr, callback, ctx) ->
    validItem = null;
    _each arr, (i) -> validItem = i if callback.call ctx, i
    validItem

_map = (arr, callback, ctx) ->
    callback.call ctx, i for i in arr

class Injector
    constructor: ->
        @_singletons = []
    get: (classCtor) ->
        dependencies = [];
        return this if classCtor is Injector

        # Is a singleton
        if classCtor.$singleton
            instance = _find @_singletons, (i) -> i instanceof classCtor

        if instance
            return instance

        if classCtor.$inject
            dependencies = _map classCtor.$inject, (classCtor) =>
                this.get classCtor

        class Ctor
            constructor: (args...) -> classCtor.apply @, args
        Ctor:: = classCtor::

        dependencies.unshift null
        _ctor = _bind.apply Ctor, dependencies
        instance = new _ctor

        if classCtor.$singleton
            this._singletons.push instance
        instance;

module.exports = Injector