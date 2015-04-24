exports.start = function (port, ssl) {
    var filters = {};
    var filterList = require('fs').readdirSync(global.HOME_DIR + '/filter/');
    for (var i = 0; i < filterList.length; i++)
        if (require('fs').existsSync(global.HOME_DIR + '/filter/' + filterList[i] + '/index.js') == true)
            filters[filterList[i]] = require(global.HOME_DIR + '/filter/' + filterList[i] + '/index.js');

    if (ssl) {
        var httpserver = require('https');
        var opts = {
            key: require('fs').readFileSync(global.config.vhost()[port].ssl.key, 'utf8'),
            cert: require('fs').readFileSync(global.config.vhost()[port].ssl.cert, 'utf8')
        };

        httpserver.createServer(opts, function (request, response) {
            orbisWebCore(request, response);
        }).listen(port, function () {
            var date = new Date();
            console.log('# Server Running : ' + port + ' (' + date + ')');
        });
    } else {
        var httpserver = require('http');
        httpserver.createServer(function (request, response) {
            orbisWebCore(request, response);
        }).listen(port, function () {
            var date = new Date();
            console.log('# Server Running : ' + port + ' (' + date + ')');
        });
    }


    var orbisWebCore = function (request, response) {
        process.setMaxListeners(0);
        process.on('uncaughtException', function (err) {
            try {
                server.printError(500, err + '');
            } catch (e) {
            }
        });

        var server = {};
        server.filters = filters;
        server.port = port;
        server.host = request.headers.host.replace(':' + port, '');
        server.lang = request.headers["accept-language"];
        server.method = request.method;
        server.path = require('url').parse(request.url).pathname;
        server.request = request;
        server.response = response;

        var vhost = global.config.vhost();
        if (!vhost[port][server.host]) server.host = 'default';
        if (!vhost[port][server.host]) {
            server.response.writeHead(404, {'Content-Type': 'text/json; charset=UTF-8'});
            server.response.end(JSON.stringify({code: 404, data: 'Not Found: No Default Home'}), 'UTF-8');
            return;
        }

        server.vhost = vhost[port][server.host];

        if (server.vhost['doc-index'] == null)
            server.vhost['doc-index'] = ['index.html', 'index.htm', 'index.php', 'index.jsp'];
        if (server.vhost['session-expire'] == null)
            server.vhost['session-expire'] = '1000*60*60*24*3';
        server.vhost['session-expire'] = server.vhost['session-expire'].replace('s', '*1000');
        server.vhost['session-expire'] = server.vhost['session-expire'].replace('m', '*60*1000');
        server.vhost['session-expire'] = server.vhost['session-expire'].replace('h', '*60*60*1000');
        server.vhost['session-expire'] = server.vhost['session-expire'].replace('d', '*24*60*60*1000');
        server.vhost['session-expire'] = server.vhost['session-expire'].replace('w', '*7*24*60*60*1000');
        var tmp = server.vhost['session-expire'].split('*');
        server.vhost['session-expire'] = 1;
        for (var i = 0; i < tmp.length; i++)
            server.vhost['session-expire'] *= tmp[i];

        var path = server.vhost['dir'] + server.path;
        if (path.substring(path.length - 1, path.length) == '/')
            path = path.substring(0, path.length - 1);
        var type = require('mime').lookup(path);
        var data = '';
        var changed = false;
        if (type == 'application/octet-stream' && require('fs').existsSync(path) == true) {
            for (var i = 0; i < server.vhost['doc-index'].length; i++) {
                if (require('fs').existsSync(path + '/' + server.vhost['doc-index'][i])) {
                    server.path += server.path.endsWith('/') ? server.vhost['doc-index'][i] : '/' + server.vhost['doc-index'][i];
                    changed = true;
                    break;
                }
            }
        }

        server.printError = function (code, data) {
            if (data == null) data = "error";
            if (server.vhost['error-page'] != null) {
                var errorPage = server.vhost['error-page'][code];
                if (errorPage != null) {
                    if (errorPage.indexOf('/') != 0) errorPage = '/' + errorPage;
                    errorPage = server.vhost['dir'] + errorPage;
                    if (require('fs').existsSync(errorPage)) {
                        var result = require('fs').readFileSync(errorPage) + '';
                        result = result.replace(/<errorMsg.*?\/?>/gi, data);
                        server.response.writeHead(code, {'Content-Type': 'text/html; charset=UTF-8'});
                        server.response.end(result, 'UTF-8');
                        return;
                    }
                }
            }
            server.response.writeHead(code, {'Content-Type': 'text/json; charset=UTF-8'});
            server.response.end(JSON.stringify({code: code, data: data}), 'UTF-8');
        };

        if (server.method == 'GET') {
            server.query = require('url').parse(request.url, true).query;
            global.module.filter.handle(server);
        } else if (request.method == 'POST') {
            var body = '';
            request.on('data', function (data) {
                body += data;
            });
            request.on('end', function () {
                body = decodeURI(body);
                server.query = require('querystring').parse(body);
                global.module.filter.handle(server);
            });
        }
    }
}