exports.filter = function (server) {
    var fs = require('fs');
    var explorer = function (dir, done) {
        var results = [];
        fs.readdir(dir, function (err, list) {
            if (err) return done(err);
            var i = 0;
            (function next() {
                var file = list[i++];
                if (!file) return done(null, results);
                file = dir + '/' + file;
                fs.stat(file, function (err, stat) {
                    if (stat && stat.isDirectory()) {
                        explorer(file, function (err, res) {
                            results = results.concat(res);
                            next();
                        });
                    } else {
                        var apiExt = server.vhost.filter.api;
                        for (var i = 0; i < apiExt.length; i++) {
                            if (file.indexOf(apiExt[i], file.length - apiExt[i].length) !== -1) {
                                results.push(file);
                            }
                        }
                        next();
                    }
                });
            })();
        });
    };

    var rootDir = server.vhost.dir;

    explorer(rootDir, function (err, results) {
        if (err) {
            exports.response(server, 500, err);
        } else {
            var html = [];
            for (var i = 0; i < results.length; i++) {
                delete require.cache[results[i]];
                var apiModule = require(results[i]);

                var description = apiModule.doc.description;
                var params = apiModule.doc.params;
                var resp = apiModule.doc.response;

                var d = {
                    'api-path': results[i].replace(rootDir, server.host + ':' + server.port),
                    'description': description,
                    'params': params,
                    'response': resp
                }

                html.push(d);
            }

            exports.response(server, 200, html);
        }
    });
}

exports.response = function (server, code, result) {
    server.response.writeHead(code, {'Content-Type': 'text/json; charset=UTF-8'});
    server.response.end(JSON.stringify(result), 'UTF-8');
}
