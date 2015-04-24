exports.filter = function (server, session) {
    var type = require('mime').lookup(server.vhost.dir + server.path);
    server.response.writeHead(200, {'Content-Type': type});
    var readStream = require('fs').createReadStream(server.vhost.dir + server.path);
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