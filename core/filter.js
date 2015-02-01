exports.handle = function (server) {
	if (server.vhost.HIDDEN_PATH != null)
		for (var i = 0; i < server.vhost.HIDDEN_PATH.length; i++)
			if (server.path.indexOf(server.vhost.HIDDEN_PATH[i]) == 0 || server.path.indexOf(server.vhost.HIDDEN_PATH[i]) == 1) {
				server.printError(404, "Page Not Found");
				return;
			}

	if (require('path').existsSync(server.vhost.DIR + server.path) == false)
		server.printError(404, 'PAGE NOT FOUND');

	global.module.session.start(server, function (session) {
		if (server.path == server.vhost.API_DOC) {
			global.module.filter.apiDoc.filter(server, session, function (code, result) {
				server.response.writeHead(code, {'Content-Type': 'text/json; charset=UTF-8'});
				server.response.end(JSON.stringify(result), 'UTF-8');
			});
		} else if (server.vhost.EXT_API != null && server.path.endsWith(server.vhost.EXT_API)) {
			global.module.filter.api.filter(server, session, function (code, result) {
				server.response.writeHead(code, {'Content-Type': 'text/json; charset=UTF-8'});
				server.response.end(JSON.stringify({code: code, data: result}), 'UTF-8');
			});
		} else if (server.vhost.EXT_ORBIS != null && server.path.endsWith(server.vhost.EXT_ORBIS)) {
			global.module.filter.orbis.filter(server, session, function (code, result) {
				if (code == 200) {
					server.response.writeHead(code, {'Content-Type': 'text/html; charset=UTF-8'});
					server.response.end(result);
				} else {
					server.printError(code, result);
				}
			});
		} else {
			global.module.filter.stream.filter(server, session, function (code, result, type) {
				if (code == 200) {
					server.response.writeHead(code, {'Content-Type': type});
					server.response.end(result);
				} else {
					server.printError(code, result);
				}
			});
		}
	});
}
