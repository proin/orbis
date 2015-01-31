exports.filter = function (server, session, callback) {
    data = require('fs').readFileSync(server.vhost.DIR + server.path);
    var type = require('mime').lookup(server.vhost.DIR + server.path);
    callback(200, data, type);
}
