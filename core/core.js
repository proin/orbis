/**
 * Running Server
 */
exports.start = function () {
    var vhost = __vhost;
    var ssl = __ssl;
    for (port in vhost) {
        if (ssl[port]) {
            require('https').createServer({
                key: require('fs').readFileSync(ssl[port].key, 'utf8'),
                cert: require('fs').readFileSync(ssl[port].cert, 'utf8')
            }, function (request, response) {
                serverHandler(request, response, vhost[port], port);
            }).listen(port, function () {
                runningMsg(port);
            });
        } else {
            require('http').createServer(function (request, response) {
                serverHandler(request, response, vhost[port], port);
            }).listen(port, function () {
                runningMsg(port);
            });
        }
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
    console.log('# Server Running : ' + date);
}