exports.print = function (server) {
    require('fs').readFile(__home + '/core/error/error-page.html', function (err, data) {
        server.response.writeHead(server.result.code, {'Content-Type': server.result.type});

        if (err) {
            server.response.end(server.result.src);
            return;
        }
        data += '';

        data = data.replace(/error-code/gim, server.result.code);
        data = data.replace(/error-msg/gim, server.result.src);
        data = data.replace(/error-host/gim, server.host);
        data = data.replace(/error-port/gim, server.port);

        server.response.end(data);
    });
}