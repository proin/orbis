exports.filter = function (global, request, response, user) {
    var path = global.path;

    path = global.vhost[global.port][global.host]['dir'] + path;
    if (path.substring(path.length - 1, path.length) == '/')
        path = path.substring(0, path.length - 1);

    var type = require('mime').lookup(path);
    var data = '';
    if (type == 'application/octet-stream') {
        type = 'text/html';
        var docIndexs = global.vhost[global.port][global.host]['doc-index'];
        if (docIndexs == null)
            docIndexs = ['index.html', 'index.htm', 'index.php', 'index.jsp'];
        for (var i = 0; i < docIndexs.length; i++) {
            if (require('path').existsSync(path + '/' + docIndexs[i])) {
                path = path + '/' + docIndexs[i];
                break;
            }
        }
    }

    data = require('fs').readFileSync(path);

    response.writeHead(200, {'Content-Type': type});
    response.end(data);
}