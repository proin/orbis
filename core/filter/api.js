exports.filter = function (server, session, callback) {
    if (require('fs').existsSync(server.vhost.DIR + server.path) == false) {
        callback(404, 'API Not Found');
        return;
    }

    delete require.cache[server.vhost.DIR + server.path];
    var apiModule = require(server.vhost.DIR + server.path);

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
        callback(403, 'Server Allows Only ' + apiModule.method + ' Method');
        return;
    }

    if (paramsRequirement == false) {
        callback(400, 'Not Enough Query');
        return;
    }

    global.module.database.connect(apiModule.db, function (err, db) {
        apiModule.result({
            response: function (code, body) {
                callback(code, body);
                try {
                    if (db != null) db.end();
                } catch(e) {
                }
            },
            query: server.query,
            db: db,
            session: session
        });
    });

}
