exports.filter = function(global, request, response, session, callback) {
	var path = global.path;

	if(require('path').existsSync(global.vhost[global.port][global.host]['dir'] + path) == false) {
		callback(404, 'Not Found');
		return;
	}

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

	if(queryOption == false) {
		callback(404, 'Not Found');
		return;
	}

	if(paramsRequirement == false) {
		callback(400, 'Not Enough Query');
		return;
	}

	global.module.database.connect(apiModule.db, function(err, db) {
		apiModule.result({
			response: function(code, body) {
				callback(code, body);
				if(db != null && db.close != null) db.close();
			},
			query: global.query,
			db: db,
			session: session
		});
	});

}
