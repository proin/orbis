exports.start = function (server) {
    this.fn(server, this.end);
};

exports.fn = function (server, callback) {
    var filters = [];
    var f = server.filter;
    delete server.filter;
    for (var ext in f)
        if (server.path.endsWith(ext) && __filters[f[ext]])
            filters.push(__filters[f[ext]]);

    var executes = -1;
    var cb = function (_s) {
        if (_s) {
            if (_s.src) server.result.src = _s.src;
            if (_s.code) server.result.code = _s.code;
            if (_s.type) server.result.type = _s.type;
        }

        executes++;
        if (executes == filters.length) {
            callback(server);
        } else if (filters[executes].start) {
            filters[executes].start(server, cb);
        } else {
            cb(null);
        }
    };

    cb();
};

exports.end = function (server) {
    require('./finalize.js').start(server);
};