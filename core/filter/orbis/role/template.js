exports.parse = function (server, session, object, callback) {
    var re = /<orbis.*?src="(.*?)".*?<\/?orbis>/gim;
    var src = re.exec(object);
    if (src == null) {
        callback('');
        return;
    }
    src = src[1];
    var url = require('url').parse(src);

    var fs = require('fs');
    var data = '';
    var resultPath;

    if (url.pathname != null) {
        if (url.pathname.startsWith('/')) {
            resultPath = server.vhost.DIR + url.pathname;
        } else {
            var path = server.path;

            var re = /<orbis.*?parent="(.*?)".*?<\/?orbis>/gim;
            var parent = re.exec(object);
            parent = parent == null ? null : parent[1];
            if (parent != null) path = parent;

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

            resultPath = server.vhost.DIR + '/';
            for (var i = 0; i < pathArr.length - pre; i++) {
                if (pathArr[i].length > 0) {
                    resultPath += pathArr[i] + '/';
                }
            }
            resultPath += targetFileName;
        }
    }

    if (require('path').existsSync(resultPath)) {
        data = fs.readFileSync(resultPath) + '';
    }

    while (true) {
        var re = /(<)(orbis)(.*?)(<\/?orbis>)/gi;
        var finded = re.exec(data);
        if (finded == null) break;
        var replacement = finded[1] + 'template-' + finded[2] + ' parent="' + resultPath.replace(server.vhost.DIR, '') + '"' + finded[3] + finded[4];
        data = data.replace(finded[0], replacement);
    }

    data = data.replace(/<template-orbis/gi, '<orbis');

    callback(data);
}
