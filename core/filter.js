exports.start = function (server, callback) {
    var filters = [];
    var f = server.filter;
    delete server.filter;
    if (f.endsWith)
        for (var ext in f.endsWith)
            if (server.path.endsWith(ext) && __filters[f.endsWith[ext]])
                filters.push(__filters[f.endsWith[ext]]);

    if (f.startsWith)
        for (var ext in f.startsWith)
            if (server.path.startsWith(ext) && __filters[f.startsWith[ext]])
                filters.push(__filters[f.startsWith[ext]]);

    var executes = -1;
    var cb = function (_s) {
        if (_s) {
            if (_s.src) server.result.src = _s.src;
            if (_s.code) server.result.code = _s.code;
            if (_s.type) server.result.type = _s.type;
            if (_s.finalize) server.result.finalize = _s.finalize;
        }

        executes++;
        if (executes == filters.length) {
            callback();
        } else if (_s && _s.finalize) {
            callback();
        } else if (filters[executes].start) {
            filters[executes].start(server, cb);
        } else {
            cb();
        }
    };

    cb();
};