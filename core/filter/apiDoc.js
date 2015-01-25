exports.filter = function(global, request, response, session) {

	var fs = require('fs');
	var explorer = function(dir, done) {
		var results = [];
		fs.readdir(dir, function(err, list) {
			if (err) return done(err);
			var i = 0;
			(function next() {
				var file = list[i++];
				if (!file) return done(null, results);
				file = dir + '/' + file;
				fs.stat(file, function(err, stat) {
					if (stat && stat.isDirectory()) {
						explorer(file, function(err, res) {
							results = results.concat(res);
							next();
						});
					} else {
						var apiExt = global.vhost[global.port][global.host]['api-ext'];
						if(file.indexOf(apiExt, file.length - apiExt.length) !== -1 ) {
							results.push(file);
						}
						next();
					}
				});
			})();
		});
	};

	var rootDir = global.vhost[global.port][global.host]['dir'];

	explorer(rootDir, function(err, results) {
		if (err) {
			response.writeHead(200, {'Content-Type' : 'text'});
			response.end(err);
		} else {
			var html = [];
			for(var i=0;i<results.length;i++) {
				delete require.cache[results[i]];
				var apiModule = require(results[i]);

				var description = apiModule.doc.description;
				var params = apiModule.doc.params;
				var resp = apiModule.doc.response;
				
				var d = {
					'api-path' : results[i].replace(rootDir, global.host + ':' + global.port),
					'description' : description,
					'params' : params,
					'response' : resp
				}

				html.push(d);
			}

			response.writeHead(200, {'Content-Type' : 'text'});
			response.end(JSON.stringify(html));

		}
	});
	
}

