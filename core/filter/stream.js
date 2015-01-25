exports.filter = function (global, request, response, session) {
    var path = global.path;

    path = global.vhost[global.port][global.host]['dir'] + path;
    if (path.substring(path.length - 1, path.length) == '/')
        path = path.substring(0, path.length - 1);

    var type = require('mime').lookup(path);
    var data = '';
    var finded = '';
    if (type == 'application/octet-stream') {
        type = 'text/html';
        var docIndexs = global.vhost[global.port][global.host]['doc-index'];
        if (docIndexs == null)
            docIndexs = ['index.html', 'index.htm', 'index.php', 'index.jsp'];
        for (var i = 0; i < docIndexs.length; i++) {
            if (require('path').existsSync(path + '/' + docIndexs[i])) {
                path = path + '/' + docIndexs[i];
                finded = '/' + docIndexs[i];
                break;
            }
        }
    }

    var orbisExt = global.vhost[global.port][global.host]['orbis-ext'];
    if (path.indexOf(orbisExt, path.length - orbisExt.length) !== -1) {
        global.path += finded;
        global.module.filter.orbis.filter(global, request, response, session);
        return;
    }

    data = require('fs').readFileSync(path);

    response.writeHead(200, {'Content-Type': type});
    response.end(data);
}