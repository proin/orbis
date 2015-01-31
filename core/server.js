exports.start = function (port) {
    var orbisWebCore = require('http').createServer(function (request, response) {
        process.setMaxListeners(0);
        process.on('uncaughtException', function (err) {
            try {
                server.printError(500, err + '');
            } catch (e) {
            }
        });

        var server = {};

        server.port = port;
        server.host = request.headers.host.replace(':' + port, '');
        server.method = request.method;
        server.path = require('url').parse(request.url).pathname;

        server.request = request;
        server.response = response;

        var vhost = global.config.vhost();
        server.vhost = {}
        server.vhost.DIR = vhost[port][server.host]['dir'];
        server.vhost.ERROR_PAGE = vhost[port][server.host]['error-page'];
        server.vhost.HIDDEN_PATH = vhost[port][server.host]['hidden-path'];
        server.vhost.API_DOC = vhost[port][server.host]['api-doc'];
        server.vhost.EXT_API = vhost[port][server.host]['api-ext'];
        server.vhost.EXT_ORBIS = vhost[port][server.host]['orbis-ext'];
        server.vhost.DOC_INDEX = vhost[port][server.host]['doc-index'];
        server.vhost.SESSION_WITH = vhost[port][server.host]['session-with'];
        server.vhost.SESSION_EXPIRE = vhost[port][server.host]['session-expire'];

        server.vhost.API_DOC = server.vhost.API_DOC != null && !server.vhost.API_DOC.startsWith('/') ? '/' + server.vhost.API_DOC : server.vhost.API_DOC;
        server.vhost.EXT_API = server.vhost.EXT_API != null && !server.vhost.EXT_API.startsWith('.') ? '.' + server.vhost.EXT_API : server.vhost.EXT_API;
        server.vhost.EXT_ORBIS = server.vhost.EXT_ORBIS != null && !server.vhost.EXT_ORBIS.startsWith('.') ? '.' + server.vhost.EXT_ORBIS : server.vhost.EXT_ORBIS;
        if (server.vhost.DOC_INDEX == null)
            server.vhost.DOC_INDEX = ['index.html', 'index.htm', 'index.php', 'index.jsp'];
        if (server.vhost.SESSION_EXPIRE == null)
            server.vhost.SESSION_EXPIRE = '1000*60*60*24*3';
        server.vhost.SESSION_EXPIRE = server.vhost.SESSION_EXPIRE.replace('s', '*1000');
        server.vhost.SESSION_EXPIRE = server.vhost.SESSION_EXPIRE.replace('m', '*60*1000');
        server.vhost.SESSION_EXPIRE = server.vhost.SESSION_EXPIRE.replace('h', '*60*60*1000');
        server.vhost.SESSION_EXPIRE = server.vhost.SESSION_EXPIRE.replace('d', '*24*60*60*1000');
        server.vhost.SESSION_EXPIRE = server.vhost.SESSION_EXPIRE.replace('w', '*7*24*60*60*1000');
        var tmp = server.vhost.SESSION_EXPIRE.split('*');
        server.vhost.SESSION_EXPIRE = 1;
        for (var i = 0; i < tmp.length; i++)
            server.vhost.SESSION_EXPIRE *= tmp[i];

        var path = server.vhost.DIR + server.path;
        if (path.substring(path.length - 1, path.length) == '/')
            path = path.substring(0, path.length - 1);
        var type = require('mime').lookup(path);
        var data = '';
        var changed = false;
        if (type == 'application/octet-stream')
            for (var i = 0; i < server.vhost.DOC_INDEX.length; i++)
                if (require('path').existsSync(path + '/' + server.vhost.DOC_INDEX[i])) {
                    server.path += server.path.endsWith('/') ? server.vhost.DOC_INDEX[i] : '/' + server.vhost.DOC_INDEX[i];
                    changed = true;
                    break;
                }
        if (changed == false && type == 'application/octet-stream') server.path += server.path.endsWith('/') ? server.vhost.DOC_INDEX[0] : '/' + server.vhost.DOC_INDEX[0];

        server.printError = function (code, data) {
            if (data == null) data = "error";
            if (server.vhost.ERROR_PAGE != null) {
                var errorPage = server.vhost.ERROR_PAGE[code];
                if (errorPage != null) {
                    if (errorPage.indexOf('/') != 0) errorPage = '/' + errorPage;
                    errorPage = server.vhost.DIR + errorPage;
                    if (require('path').existsSync(errorPage)) {
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
    });

    orbisWebCore.listen(global.port, function () {
        var date = new Date();
        console.log('# Server Running : ' + global.port + ' (' + date + ')');
    });
}