exports.map = function(path, result, query) {
	if(path.indexOf('.js') == -1)
		return result;
	
	result = result + '';
	
	var pattern = /#.[^;]*/gi;
	var apiConnector = result.match(pattern);
	
	var vhost = JSON.parse(require('fs').readFileSync('./vhost.json')+'');
	
	for(var i in apiConnector) {
		var apiInfo = JSON.parse(apiConnector[i].replace(/ /gi, '').replace('#.', ''));
		var url = require('url').parse(apiInfo.api);
			
		delete require.cache[vhost[url.port][url.hostname]['dir'] + url.path.replace(vhost[url.port][url.hostname]['api-ext'], '.api.js')];
		var apiModule = require(vhost[url.port][url.hostname]['dir'] + url.path.replace(vhost[url.port][url.hostname]['api-ext'], '.api.js'));
				
		try {
			console.log ( JSON.stringify( apiModule.result(apiInfo.query) ) );
			result = result.replace(apiConnector[i], JSON.stringify( apiModule.result(apiInfo.query) ));
		} catch(e) {
			result = result.replace(apiConnector[i], '{}');
		}
	}
	
	return result;
}