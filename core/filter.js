exports.start = function (server, callback) {
    var filters = [];
    var f = server.filter;
    delete server.filter;

    for (var m in f) {
        var exp = f[m];
        if (exp.length) {
            for (var i = 0; i < exp.length; i++) {
                if (server.path.match(exp[i])) {
                    filters.push(__filters[m]);
                    break;
                }
            }
        } else {
            if (server.path.match(exp))
                filters.push(__filters[m]);
        }
    }

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