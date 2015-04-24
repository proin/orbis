exports.filter = function (server, session) {
    var path = server.vhost.dir + server.path;
    if (require('fs').existsSync(path) == false) {
        exports.response(server, 404, 'Page Not Found', 'text/html');
        return;
    }

    exports.run_cmd('php', [path], function (result) {
        exports.response(server, 200, result, 'text/html');
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

exports.run_cmd = function (cmd, args, callBack) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) {
        resp += buffer.toString()
    });

    child.stdout.on('end', function () {
        callBack(resp)
    });
}