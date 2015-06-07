exports.start = function (server, callback) {
    server.middleware = {};
    var middlewares = [];
    for (var n in __middlewares)
        middlewares.push({name: n, fn: __middlewares[n]});

    // start middlewares
    var executes = -1;
    var cb = function (_s) {
        if (typeof _s == 'object')
            server.middleware[middlewares[executes].name] = _s;
        executes++;
        if (executes == middlewares.length) {
            callback();
        } else if (middlewares[executes].fn.start) {
            middlewares[executes].fn.start(server, cb);
        } else {
            cb(null);
        }
    };
    cb();
};