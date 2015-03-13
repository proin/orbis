exports.parse = function (server, session, object, callback) {
    var re = /<orbis.*?src="(.*?)".*?<\/?orbis>/gim;
    var src = re.exec(object);
    if (src == null) {
        callback('');
        return;
    }
    src = src[1];
    var url = require('url').parse(src);
    var apiPath = '';

    if (url.host != null) {
        apiPath = global.config.vhost()[url.port][url.hostname]['dir'] + url.pathname;
    } else {
        if (url.pathname.startsWith('/')) {
            if (require('fs').existsSync(server.vhost.DIR + url.pathname))
                apiPath = server.vhost.DIR + url.pathname;
        } else {
            var path = server.path;
            var pathArr = path.split('/');

            var pre = 1;
            var targetArr = url.pathname.split('/');
            var targetFileName = '';
            for (var i = 0; i < targetArr.length; i++) {
                if (targetArr[i].length > 0 && targetArr[i] != '.' && targetArr[i] != '..') {
                    if (i == targetArr.length - 1) {
                        targetFileName += targetArr[i];
                    } else {
                        targetFileName += targetArr[i] + '/';
                    }
                }
                if (targetArr[i] == '..') {
                    pre++;
                }
            }

            var resultPath = server.vhost.DIR + '/';
            for (var i = 0; i < pathArr.length - pre; i++)
                if (pathArr[i].length > 0)
                    resultPath += pathArr[i] + '/';
            resultPath += targetFileName;

            if (require('fs').existsSync(resultPath))
                apiPath = resultPath;
        }
    }

    if (require('fs').existsSync(apiPath) == false) {
        callback({code: 404, data: 'Not Found'});
        return;
    }

    delete require.cache[apiPath];
    var apiModule = require(apiPath);

    var keys = [];
    Object.keys(apiModule.doc.params).forEach(function (key) {
        keys.push(key);
    });

    url.query = require('querystring').parse(url.query);

    Object.keys(server.query).forEach(function (key) {
        if (url.query[key] == null) {
            url.query[key] = server.query[key];
        }
    });

    var paramsRequirement = true;
    for (var i = 0; i < keys.length; i++) {
        if (apiModule.doc.params[keys[i]].indexOf('optional') == -1) {
            if (url.query[keys[i]] == null) {
                paramsRequirement = false;
            }
        }
    }

    var queryOption = false;
    if (apiModule.method == 'GET') {
        if (server.request.method == 'GET')
            queryOption = true;
    }

    if (apiModule.method == 'POST') {
        if (server.request.method == 'POST')
            queryOption = true;
    }

    if (apiModule.method == 'AUTO') {
        queryOption = true;
    }

    if (queryOption == false) {
        callback({code: 403, data: 'Server Allows Only ' + apiModule.method + ' Method'});
        return;
    }

    if (paramsRequirement == false) {
        callback({code: 400, data: 'Not Enough Query'});
        return;
    }

    global.module.database.connect(apiModule.db, function (err, db) {
        apiModule.result({
            response: function (code, body) {
                try {
                    if (db != null) global.module.database.close(apiModule.db, db);
                } catch (e) {
                }
                callback({code: code, data: body});
            },
            query: url.query,
            db: db,
            session: session
        });
    });
}