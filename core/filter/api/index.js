exports.filter = function (server, session) {
    if (require('fs').existsSync(server.vhost.dir + server.path) == false) {
        exports.response(server, 404, 'API Not Found');
        return;
    }

    delete require.cache[server.vhost.dir + server.path];
    var apiModule = require(server.vhost.dir + server.path);

    var keys = [];
    Object.keys(apiModule.doc.params).forEach(function (key) {
        keys.push(key);
    });

    var paramsRequirement = true;
    for (var i = 0; i < keys.length; i++) {
        if (apiModule.doc.params[keys[i]].indexOf('optional') == -1) {
            if (server.query[keys[i]] == null) {
                paramsRequirement = false;
            }
        }
    }

    var queryOption = false;
    if (apiModule.method == 'GET') {
        if (server.method == 'GET')
            queryOption = true;
    }

    if (apiModule.method == 'POST') {
        if (server.method == 'POST')
            queryOption = true;
    }

    if (apiModule.method == 'AUTO')
        queryOption = true;

    if (queryOption == false) {
        exports.response(server, 403, 'Server Allows Only ' + apiModule.method + ' Method');
        return;
    }

    if (paramsRequirement == false) {
        exports.response(server, 400, 'Not Enough Query');
        return;
    }

    global.module.database.connect(apiModule.db, function (err, db) {
        apiModule.result({
            response: function (code, body) {
                exports.response(server, code, body);
                try {
                    if (db != null) global.module.database.close(apiModule.db, db);
                } catch (e) {
                }
            },
            query: server.query,
            db: db,
            session: session
        });
    });
}

exports.response = function (server, code, result) {
    server.response.writeHead(code, {'Content-Type': 'text/json; charset=UTF-8'});
    server.response.end(JSON.stringify({code: code, data: result}), 'UTF-8');
}