exports.handle = function(global, request, response) {
	global.module.session.start(global, request, response, function(session) {
		var apiExt = global.vhost[global.port][global.host]['api-ext'].replace('.', '');
		var pathSplit = global.path.split('.');
		
		if(pathSplit.length > 1 && apiExt == pathSplit[pathSplit.length - 1]) global.module.filter.api.filter(global, request, response, session);
		else if(global.path == global.vhost[global.port][global.host]['api-doc']) global.module.filter.apiDoc.filter(global, request, response, session);
		else global.module.filter.stream.filter(global, request, response, session);
	});
}