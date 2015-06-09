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

global.__response_status_code = {
    100: "Continue",
    101: "Switching Protocols",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Request Entity Too Large",
    414: "Request-URI Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    511: "Network Authentication Required",
    0: null
};