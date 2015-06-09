/**
 * [connection flows]
 * connectioin.js -> request.js -> middleware.js -> filter.js -> finalize.js
 *
 * @param opts: variable from core.js
 */

exports.connect = function (server) {
    // Error Handling
    process.setMaxListeners(0);
    process.on('uncaughtException', function (err) {
        if (!server) return;
        server.result = {};
        server.result.code = 500;
        server.result.type = 'text/html';
        server.result.src = 'Internal Server Error:<br>- ' + err;
        if (server.response) require('./error.js').print(server);
    });

    // Extract Request Info.
    var request = server.request;
    server.host = request.headers.host.replace(':' + server.port, '');
    if (!server.vhost[server.host]) server.host = '0.0.0.0';
    server.hostname = request.headers.host.replace(':' + server.port, '');

    server.lang = request.headers["accept-language"];
    server.method = request.method;
    server.path = require('url').parse(request.url).pathname;

    // Virtual Host Information Mapping
    server.web_dir = server.vhost[server.host].dir;
    server.web_doc_index = server.vhost[server.host].index;
    server.web_file = server.web_dir + server.path;
    server.filter = server.vhost[server.host].filter;

    server.result = {};

    if (server.web_file.endsWith('/'))
        server.web_file = server.web_file.substring(0, server.web_file.length - 1);

    // mapping web path to server path
    if (require('fs').existsSync(server.web_file) == false) {
        server.result.code = 404;
        server.result.type = 'text/html';
        server.result.src = 'Not Found:<br>- The requested URL ' + server.path + ' was not found on this server.';
    } else {
        server.result.code = 200;
        server.result.type = require('mime').lookup(server.web_file);
    }

    if (server.result.code == 200 && require('fs').lstatSync(server.web_file).isDirectory()) {
        server.result.code = 404;

        for (var i = 0; i < server.web_doc_index.length; i++) {
            var fpath = server.web_file + '/' + server.web_doc_index[i];
            if (require('fs').existsSync(fpath) == true) {
                if (!server.path.endsWith('/')) {
                    server.response.writeHead(302, {
                        'Location': server.path + '/'
                    });
                    server.response.end();
                    return;
                }

                server.web_file = fpath;
                server.path += '/' + server.web_doc_index[i];

                server.result.code = 200;
                server.result.type = require('mime').lookup(server.web_file);
                delete server.result.src;
                break;
            }
        }

        if (server.result.code == 404) {
            server.result.type = 'text/html';
            server.result.src = 'Not Found:<br>- The requested URL ' + server.path + ' was not found on this server.';
            require('./error.js').print(server);
            return;
        }
    }

    var logics = [
        require('./request.js'),
        require('./middleware.js'),
        require('./filter.js'),
        require('./finalize.js')
    ];

    var executes = -1;
    var cb = function () {
        executes++;
        if (executes == logics.length) {
        } else if (logics[executes].start) {
            logics[executes].start(server, cb);
        } else {
            cb();
        }
    };
    cb();
};