exports.start = function (server) {
    if (server.result.code == 200 && server.result.src) {
        // if result is already exists by middleware or filter
        server.response.writeHead(server.result.code, {'Content-Type': server.result.type});
        server.response.end(server.result.src);
    } else if (server.result.code == 200) {
        // if result is not exists by middleware or filter
        server.response.writeHead(200, {'Content-Type': server.result.type});

        var readStream = require('fs').createReadStream(server.web_file);
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

    } else {
        // no file or something trouble in server
        require('./error.js').print(server);
    }
};