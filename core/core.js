/**
 * Running Server
 */
exports.start = function () {
    var vhost = __vhost;

    for (var port in vhost) {
        start(port);
    }
}

function start(port) {
    var vhost = __vhost;
    var ssl = __ssl;

    if (ssl[port]) {
        var https = require('https').createServer({
            key: require('fs').readFileSync(ssl[port].key, 'utf8'),
            cert: require('fs').readFileSync(ssl[port].cert, 'utf8')
        }, function (request, response) {
            serverHandler(request, response, vhost[port], port);
        });

        https.listen(port, function () {
            runningMsg(port);
        });
    } else {
        var http = require('http').createServer(function (request, response) {
            serverHandler(request, response, vhost[port], port);
        });

        http.listen(port, function () {
            runningMsg(port);
        })
    }
}

/**
 * Request and Response Handler
 * @param request: web server request
 * @param response: web server response
 * @param vhost: virtual host information
 * @param port: server port
 */
function serverHandler(request, response, vhost, port) {
    var server = {}; // Local Variable about Request Information
    server.port = port; // requested port
    server.vhost = vhost;
    server.request = request; // web server request
    server.response = response; // web server response

    // Conntection Controller
    require('./connection.js').connect(server);
}

// Server Running Message
function runningMsg(port) {
    var date = new Date();
    console.log('# Server Running : ' + port + ' (' + date + ')');
}