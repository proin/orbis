exports.filter = function (server, session, filterext) {
    var path = global.config.orbis()['central-repo-dir'];
    if (path.endsWith('/') == false) path += '/';
    path += server.path.replace(filterext, '');
    if (require('fs').existsSync(path) == false) {
        server.printError(404, 'NOT FOUND: No Library File');
        return;
    }

    var type = require('mime').lookup(path);
    if (type == 'application/octet-stream') {
        server.printError(404, 'NOT FOUND: No Library File');
        return;
    }


    server.response.writeHead(200, {'Content-Type': type});
    var readStream = require('fs').createReadStream(path);
    readStream.on('data', function (chunk) {
        if (!server.response.write(chunk)) {
            readStream.pause();
        }
    });

    readStream.on('end', function () {
        server.response.end();
    });

    server.response.on('drain', function () {
        readStream.resume();
    });
}