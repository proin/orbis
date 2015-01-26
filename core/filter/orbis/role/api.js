exports.parse = function(global, request, response, session, object, callback) {
	var src = object.attr('src');
	var url = require('url').parse(src);

	var apiPath = '';

	if(url.host != null) {
		apiPath = global.vhost[url.port][url.hostname]['dir'] + url.pathname;
	} else if(url.pathname != null) {
		if( url.pathname.indexOf('/') == 0 ) {
			if(require('path').existsSync(global.vhost[global.port][global.host]['dir'] + url.pathname)) {
				apiPath = global.vhost[global.port][global.host]['dir'] + url.pathname;
			}
		}

		var path = global.path;
		var pathArr = path.split('/');

		var pre = 1;
		var targetArr = url.pathname.split('/');
		var targetFileName = '';
		for(var i=0;i<targetArr.length;i++) {
			if(targetArr[i].length > 0 && targetArr[i] != '.' && targetArr[i] != '..'){
				if(i == targetArr.length - 1) {
					targetFileName += targetArr[i];
				} else {
					targetFileName += targetArr[i] + '/';
				}
			}
			if(targetArr[i] == '..') {
				pre++;
			}
		}

		var resultPath = global.vhost[global.port][global.host]['dir']+  '/';
		for(var i=0;i<pathArr.length - pre;i++) {
			if(pathArr[i].length > 0) {
				resultPath += pathArr[i] + '/';
			}
		}
		resultPath += targetFileName;

		if(require('path').existsSync(resultPath)) {
			apiPath = resultPath;
		}
	} else {
		apiPath = global.vhost[url.port][url.hostname]['dir'] + url.pathname;
	}

	if(require('path').existsSync(apiPath) == false) {
		callback('api', { print : { code : 404 , data : 'Not Found' } });
		return;
	}

	delete require.cache[apiPath];
	var apiModule = require(apiPath);

	var keys = [];
	Object.keys(apiModule.doc.params).forEach(function(key) {
		keys.push(key);
	});

	url.query = require('querystring').parse(url.query);

	Object.keys(global.query).forEach(function(key) {
		if(url.query[key] == null) {
			url.query[key] = global.query[key];
		}
	});

	var paramsRequirement = true;
	for(var i=0;i<keys.length;i++) {
		if(apiModule.doc.params[keys[i]].indexOf('optional') == -1) {
			if(url.query[keys[i]] == null) {
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

	if(apiModule.method == 'AUTO') {
		queryOption = true;
	}

	if(queryOption == false) {
		callback('api', { print : { code : 404, data : 'Not Found' } });
		return;
	}

	if(paramsRequirement == false) {
		callback('api', { print : { code : 400, data : 'Not Enough Query' } });
		return;
	}

	global.module.database.connect(apiModule.db, function(err, db) {
		apiModule.result({
			response: function(code, body) {
				try {
					if(db != null && db.close != null) db.close();
				} catch(e) {
				}
				callback('api', { print : { code : code, body : body } });
			},
			query: global.query,
			db: db,
			session: session
		});
	});
}
