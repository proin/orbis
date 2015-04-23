exports.filter = function (server, session) {
    var type = require('mime').lookup(server.vhost.dir + server.path);
    data = require('fs').readFile(server.vhost.dir + server.path, function (err, data) {
        if (err) {
            exports.response(server, 500, err, type);
            return;
        }
        exports.response(server, 200, data, type);
    });
}

exports.response = function (server, code, result, type) {
    if (code == 200) {
        server.response.writeHead(code, {'Content-Type': type});
        server.response.end(result);
    } else {
        server.printError(code, result);
    }
}