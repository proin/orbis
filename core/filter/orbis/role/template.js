exports.parse = function(global, request, response, session, window, keys, idx, callback) {
	var $ = window.$;
	var src = $('[orbis-id="' + keys[idx] + '"]').attr('src');
	var url = require('url').parse(src);

	var fs = require('fs');

	if(url.host != null) {
		var data = fs.readFileSync(global.vhost[url.port][url.hostname]['dir'] + url.pathname);	
		callback('template', { data : data + '' });
		return;
	} else if(url.pathname != null) {
		if( url.pathname.indexOf('/') == 0 ) {
			if(require('path').existsSync(global.vhost[global.port][global.host]['dir'] + url.pathname) == false) {
				callback('template', { data : '' });
				return;			
			}
			var data = fs.readFileSync(global.vhost[global.port][global.host]['dir'] + url.pathname);
			callback('template', { data : data + '' });
			return;
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

		if(require('path').existsSync(resultPath) == false) {
			callback('template', { data : '' });
			return;			
		}

		var data = fs.readFileSync(resultPath);
		callback('template', { data : data + '' });
		return;
	}

	callback('template', { data : '' });
}