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

    var database = server.middleware.database;

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
        callback({code: 403, type: 'text/html', src: 'This API Allows Only ' + apiModule.method + ' Method.', finalize: true});
        return;
    }

    if (paramsRequirement == false) {
        callback({code: 400, type: 'text/html', src: 'Not Enough Query.', finalize: true});
        return;
    }

    if (apiModule.db) {
        database.connect(apiModule.db, function (err, db) {
            if (err) {
                callback({code: 500, type: 'text/html', src: JSON.stringify(err), finalize: true});
                return;
            }

            var _s = {
                $query: server.query,
                $database: db,
                $middleware: server.middleware,
                $response: function (result) {
                    try {
                        if (db != null) database.close(apiModule.db, db);
                    } catch (e) {
                    }
                    if (!result)
                        callback({code: 500, type: 'text/html', src: 'Internal Server Error (API)', finalize: true});
                    else if (!result.result)
                        callback({code: 500, type: 'text/html', src: 'Internal Server Error (API)', finalize: true});
                    else
                        callback({code: 200, type: result.type, src: result.result, finalize: true});
                }
            };

            apiModule.result.map(_s)();
            //apiModule.result(_s, function (result) {
            //    try {
            //        if (db != null) database.close(apiModule.db, db);
            //    } catch (e) {
            //    }
            //    if (!result)
            //        callback({code: 500, type: 'text/html', src: 'Internal Server Error (API)', finalize: true});
            //    else if (!result.result)
            //        callback({code: 500, type: 'text/html', src: 'Internal Server Error (API)', finalize: true});
            //    else
            //        callback({code: 200, type: result.type, src: result.result, finalize: true});
            //});
        });
    } else {
        var _s = {
            $query: server.query,
            $middleware: server.middleware,
            $response: function (result) {
                if (!result)
                    callback({code: 500, type: 'text/html', src: 'Internal Server Error (API)', finalize: true});
                else if (!result.result)
                    callback({code: 500, type: 'text/html', src: 'Internal Server Error (API)', finalize: true});
                else
                    callback({code: 200, type: result.type, src: result.result, finalize: true});
            }
        };

        apiModule.result.map(_s)();
        //apiModule.result(_s, function (result) {
        //    if (!result)
        //        callback({code: 500, type: 'text/html', src: 'Internal Server Error (API)', finalize: true});
        //    else if (!result.result)
        //        callback({code: 500, type: 'text/html', src: 'Internal Server Error (API)', finalize: true});
        //    else
        //        callback({code: 200, type: result.type, src: result.result, finalize: true});
        //});
    }
}