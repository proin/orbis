exports.filter = function (server, session, module) {
    var mdata = module;
    if (!mdata) {
        mdata = {};
        mdata.path = server.vhost.dir + server.path;
        mdata.callback = exports.response;
        mdata.query = server.query;
    }

    var modules = {
        database: require(__dirname + '/modules/database.js')
    };

    if (require('fs').existsSync(mdata.path) == false) {
        mdata.callback(server, 404, 'API Not Found');
        return;
    }

    delete require.cache[mdata.path];
    var apiModule = require(mdata.path);

    var keys = [];
    Object.keys(apiModule.doc.params).forEach(function (key) {
        keys.push(key);
    });

    var paramsRequirement = true;
    for (var i = 0; i < keys.length; i++)
        if (apiModule.doc.params[keys[i]].indexOf('optional') == -1)
            if (!mdata.query[keys[i]])
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
        mdata.callback(server, 403, 'Server Allows Only ' + apiModule.method + ' Method');
        return;
    }

    if (paramsRequirement == false) {
        mdata.callback(server, 400, 'Not Enough Query');
        return;
    }

    modules.database.connect(apiModule.db, function (err, db) {
        var orbisModules = {
            response: function (code, body) {
                mdata.callback(server, code, body);
                try {
                    if (db != null) global.module.database.close(apiModule.db, db);
                } catch (e) {
                }
            },
            query: mdata.query,
            db: db,
            session: session
        };
        apiModule.result(orbisModules);
    });
}

exports.response = function (server, code, result) {
    server.response.writeHead(code, {'Content-Type': 'text/json; charset=UTF-8'});
    server.response.end(JSON.stringify({code: code, data: result}), 'UTF-8');
}