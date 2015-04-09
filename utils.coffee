exports.find = (array, cb) ->
    for i in array
        if cb i then return i
    return null

exports.assign = (obj, src) ->
    for k, v of src
        obj[k] = v
    obj

exports.map = (items, cb) -> cb i for i in items