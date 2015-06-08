/**
 * create api document in web root directory.
 *
 * @param server
 * @param callback
 */
exports.start = function (server, callback) {
    var apiExt = {startsWith: [], endsWith: []};
    for (var ext in server.vhost.filter.endsWith)
        if (server.vhost.filter.endsWith[ext] == 'api')
            apiExt.endsWith.push(ext);

    for (var ext in server.vhost.filter.startsWith)
        if (server.vhost.filter.startsWith[ext] == 'api')
            apiExt.startsWith.push(ext);

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
                        for (var i = 0; i < apiExt.endsWith.length; i++)
                            if (file.endsWith(apiExt.endsWith[i])) {
                                results.push(file);
                                next();
                                return;
                            }
                        for (var i = 0; i < apiExt.startsWith.length; i++)
                            if (file.startsWith(apiExt.startsWith[i])) {
                                results.push(file);
                                next();
                                return;
                            }
                    }
                });
            })();
        });
    };

    var rootDir = server.web_dir;

    explorer(rootDir, function (err, results) {
        if (err) {
            callback({code: 500, type: 'text/html', src: JSON.stringify(err)});
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

            callback({code: 200, type: 'text/html', src: JSON.stringify(html)});
        }
    });
}