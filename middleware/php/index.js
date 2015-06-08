exports.start = function (server, callback) {
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        server.address = add;
        fn(server, callback);
    });
}

exports.bin = 'php-cgi';

var fn = function (server, callback) {
    var bin = exports.bin;

    var spawn = require('child_process').spawn;

    var req_env = {};
    req_env['HTTP_HOST'] = server.request.headers['host'];
    req_env['HTTP_ACCEPT'] = server.request.headers['accept'];
    req_env['HTTP_CONNECTION'] = server.request.headers['connection'];
    req_env['HTTP_COOKIE'] = server.request.headers.cookie;
    req_env['HTTP_USER_AGENT'] = server.request.headers['user-agent'];
    req_env['HTTP_ACCEPT_LANGUAGE'] = server.request.headers['accept-language'];
    req_env['HTTP_CACHE_CONTROL'] = server.request.headers['cache-control'];
    req_env['HTTP_ACCEPT_ENCODING'] = server.request.headers['accept-encoding'];
    req_env['PATH'] = process.env['PATH'];
    //req_env['SERVER_SIGNATURE'] = process.env['PATH'];
    req_env['SERVER_SOFTWARE'] = 'orbis/0.2.1';
    req_env['SERVER_NAME'] = server.request.headers['host'];
    req_env['SERVER_ADDR'] = server.address;
    req_env['SERVER_PORT'] = server.port;
    req_env['REMOTE_ADDR'] = server.request.connection.remoteAddress;
    req_env['DOCUMENT_ROOT'] = server.web_dir;
    req_env['REQUEST_SCHEME'] = 'http';
    req_env['CONTEXT_DOCUMENT_ROOT'] = server.web_dir;
    req_env['SCRIPT_FILENAME'] = server.web_file;
    req_env['REMOTE_PORT'] = server.request.connection.remotePort;
    req_env['GATEWAY_INTERFACE'] = 'CGI/1.1';
    req_env['SERVER_PROTOCOL'] = (server.request.client['npnProtocol'] + '').toUpperCase();
    req_env['REQUEST_METHOD'] = server.method;
    req_env['QUERY_STRING'] = server.querystring;
    req_env['REQUEST_URI'] = server.request.url;
    req_env['SCRIPT_NAME'] = server.path;
    req_env['PHP_SELF'] = server.path;
    req_env['REDIRECT_STATUS'] = 'CGI';

    //if (server.request.headers['content-length']) req_env['CONTENT_LENGTH'] = server.request.headers['content-length'];
    if (server.request.headers['content-type']) req_env['CONTENT_TYPE'] = server.request.headers['content-type'];
    if (server.request.headers['csp']) req_env['CSP'] = server.request.headers['csp'];
    if (server.request.headers['origin']) req_env['HTTP_ORIGIN'] = server.request.headers['origin'];

    var m = function (cb) {
        var params = [];
        var q = require('querystring').stringify(server.query);
        if (server.method == 'POST') {
            for (var k in server.query)
                params.push('-d ' + k + '[=' + server.query[k] + ']');
            //req_env['CONTENT_LENGTH'] = q.length;
            //req_env['CONTENT_BODY'] = q;
            //req_env['BODY'] = q;
        }

        var cgi = spawn(bin, params, {
            env: req_env
        });

        cgi.stdout.on('data', function (data) {
            var result = data + '';
            var headers = result.substring(0, result.indexOf('\r\n\r\n')).replace(/\r/gi, '').split('\n');
            result = result.substring(result.indexOf('\r\n\r\n') + '\r\n\r\n'.length);
            var h = {};
            for (var i = 0; i < headers.length; i++) {
                if (headers[i].length == 0)
                    break;
                var header = headers[i].split(':');

                var key = header[0];
                var value = '';
                for (var j = 1; j < header.length; j++)
                    value += header[j] + ':';
                if (value.endsWith(':'))
                    value = value.substring(0, value.length - 1);
                while (value.startsWith(' '))
                    value = value.substring(1, value.length);
                h[key] = value;
            }

            if (h['Status']) {
                var statuscode = parseInt(h['Status']);
                server.response.writeHead(statuscode, h);
                server.response.end();
                return;
            }

            cb(result);
        });

        cgi.stderr.on('data', function (data) {
        });

        cgi.on('close', function (code) {
        });
    };

    callback(m);
}