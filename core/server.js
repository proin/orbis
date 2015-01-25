exports.start = function (global) {

    var filter = require('./filter.js');
    var server = require('http').createServer(function (request, response) {
        process.setMaxListeners(0);
        process.on('uncaughtException', function (err) {
            try {
                response.writeHead(404, {'Content-Type': 'text/json'});
                response.end(JSON.stringify({code: 404, data: err + ''}));
            } catch (e) {
            }
        });

        global.vhost = global.config.vhost();
        global.host = request.headers.host.replace(':' + global.port, '');
        global.path = require('url').parse(request.url).pathname;
        global.hostSrc = global.vhost[global.port][global.host]['dir'];

        if (request.method == 'GET') {
            global.query = require('url').parse(request.url, true).query;
            filter.handle(global, request, response);
        } else if (request.method == 'POST') {
            var body = '';

            request.on('data', function (data) {
                body += data;
            });

            request.on('end', function () {
                body = decodeURI(body);
                global.query = require('querystring').parse(body);
                filter.handle(global, request, response);
            });
        }
    });

    server.listen(global.port, function () {
        var date = new Date();
        console.log('# Server Running : ' + global.port + ' (' + date + ')');
    });
}