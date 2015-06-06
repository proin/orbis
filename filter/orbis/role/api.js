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
            if (require('fs').existsSync(server.vhost.dir + url.pathname))
                apiPath = server.vhost.dir + url.pathname;
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

            var resultPath = server.vhost.dir + '/';
            for (var i = 0; i < pathArr.length - pre; i++)
                if (pathArr[i].length > 0)
                    resultPath += pathArr[i] + '/';
            resultPath += targetFileName;

            if (require('fs').existsSync(resultPath))
                apiPath = resultPath;
        }
    }

    url.query = require('querystring').parse(url.query);
    Object.keys(server.query).forEach(function (key) {
        if (url.query[key] == null) {
            url.query[key] = server.query[key];
        }
    });

    var mdata = {
        path: apiPath,
        query: url.query,
        callback: function (server, code, data) {
            callback({code: code, data: data});
        }
    }

    server.filters.api.filter(server, session, mdata);
}