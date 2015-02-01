exports.filter = function (server, session, callback) {
	var type = require('mime').lookup(server.vhost.DIR + server.path);
	data = require('fs').readFile(server.vhost.DIR + server.path, function (err, data) {
		if (err) {
			callback(500, err, type);
			return;
		}
		callback(200, data, type);
	});
}
