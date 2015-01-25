exports.filter = function(global, request, response, session) {
	var path = global.path;
	delete require.cache[global.vhost[global.port][global.host]['dir'] + path];
	var apiModule = require(global.vhost[global.port][global.host]['dir'] + path);

	var keys = [];
	Object.keys(apiModule.doc.params).forEach(function(key) {
		keys.push(key);
	});

	var paramsRequirement = true;
	for(var i=0;i<keys.length;i++) {
		if(apiModule.doc.params[keys[i]].indexOf('optional') == -1) {
			if(global.query[keys[i]] == null) {
				paramsRequirement = false;
			}
		}
	}

	if(paramsRequirement == false) {
		response.writeHead(200, { 'Content-Type': 'text/json; charset=UTF-8' });
		response.end(JSON.stringify({ code : 400 , data : 'not enough query' }), 'UTF-8');
		return;
	}

	global.module.database.connect(apiModule.db, function(err, db) {
		var queryOption = false;
		if(apiModule.method == 'GET') {
			if(request.method == 'GET')
				queryOption = true;
		}

		if(apiModule.method == 'POST') {
			if(request.method == 'POST')
				queryOption = true;
		}

		if(apiModule.method == 'AUTO')
			queryOption = true;

		if(queryOption == true) {
			apiModule.result(
				function(body, callbackDB) {
					response.writeHead(200, { 'Content-Type': 'text/json; charset=UTF-8' });
					response.end(JSON.stringify(body), 'UTF-8');
					if(callbackDB != null) callbackDB.close();
				},
				global.query, db, session
				);
		} else {
			var body = {};
			body.code = 404;
			body.data = 'Page Not Found';
			response.writeHead(200, { 'Content-Type': 'text/json; charset=UTF-8' });
			response.end(JSON.stringify(body), 'UTF-8');
		}
	});
}