/**
 * api filter
 *
 * @param server
 * @param callback
 */
exports.start = function (server, callback) {
    if (server.result.code == 404) {
        callback();
        return;
    }

    var database = require(__dirname + '/modules/database.js')

    delete require.cache[server.web_file];
    var apiModule = require(server.web_file);

    var keys = [];
    Object.keys(apiModule.doc.params).forEach(function (key) {
        keys.push(key);
    });

    var paramsRequirement = true;
    for (var i = 0; i < keys.length; i++)
        if (apiModule.doc.params[keys[i]].indexOf('optional') == -1)
            if (!server.query[keys[i]])
                paramsRequirement = false;

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
        server.result.code = 403;
        server.result.type = 'text/html';
        server.result.src = 'This API Allows Only ' + apiModule.method + ' Method.';
        callback(server);
        return;
    }

    if (paramsRequirement == false) {
        server.result.code = 400;
        server.result.type = 'text/html';
        server.result.src = 'Not Enough Query.';
        callback(server);
        return;
    }

    database.connect(apiModule.db, function (err, db) {
        if (err) {
            callback({code: 500, type: 'text/html', src: JSON.stringify(err)});
            return;
        }

        var _s = {
            query: server.query,
            db: db,
            middleware: server.middleware
        };

        apiModule.result(_s, function (result) {
            callback({type: result.type, src: result.result});
            try {
                if (db != null) database.close(apiModule.db, db);
            } catch (e) {
            }
        });
    });
}