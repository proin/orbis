/**
 * php middleware.
 * this is not completed.
 * be careful to use.
 *
 * @param server
 * @param callback
 */
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
    req_env['PATH'] = process.env['PATH'];
    req_env['DOCUMENT_ROOT'] = server.web_dir;
    req_env['CONTEXT_DOCUMENT_ROOT'] = server.web_dir;
    req_env['SCRIPT_FILENAME'] = server.web_file;
    req_env['GATEWAY_INTERFACE'] = 'CGI/1.1';
    req_env['QUERY_STRING'] = server.querystring;
    req_env['SCRIPT_NAME'] = server.path;
    req_env['PHP_SELF'] = server.path;
    //req_env['SERVER_SIGNATURE'] = process.env['PATH'];
    req_env['SERVER_SOFTWARE'] = 'orbis/' + __version;
    req_env['SERVER_NAME'] = server.request.headers['host'];
    req_env['SERVER_ADDR'] = server.address;
    req_env['SERVER_PORT'] = server.port;
    req_env['SERVER_PROTOCOL'] = 'http';
    req_env['REMOTE_ADDR'] = server.request.connection.remoteAddress;
    req_env['REMOTE_PORT'] = server.request.connection.remotePort;
    req_env['REQUEST_SCHEME'] = 'http';
    req_env['REQUEST_METHOD'] = server.method;
    req_env['REQUEST_URI'] = server.request.url;
    req_env['REDIRECT_STATUS'] = 'CGI';

    for (var key in server.request.headers) {
        var env_name = 'HTTP_' + (key + '').toUpperCase().replace(/-/gi, '_');
        var env_val = server.request.headers[key];
        req_env[env_name] = env_val;
    }

    if ('content-length' in server.request.headers) req_env['CONTENT_LENGTH'] = server.request.headers['content-length'];
    if ('content-type' in server.request.headers) req_env['CONTENT_TYPE'] = server.request.headers['content-type'];
    if ('authorization' in server.request.headers) req_env['AUTH_TYPE'] = server.request.headers.authorization.split(' ')[0];

    var m = function (cb) {
        var params = [];
        var q = require('querystring').stringify(server.query);
        if (server.method == 'POST') {
            for (var k in server.query)
                params.push(k + '=' + server.query[k]);
        }

        var cgi = spawn(bin, params, {
            env: req_env
        });

        server.request.pipe(cgi.stdin);

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