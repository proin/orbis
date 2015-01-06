exports.map = function(path, result) {
	if(path.indexOf('.html') == -1)
		return result;
	
	result = result + '';

	var vhost = JSON.parse( require('fs').readFileSync('./vhost.json') + '' );	

	var pattern = /<!--#dir[^#]*#-->/g;
	var dirTags = result.match(pattern);
	
	for(var i in dirTags) {
		var dirTag = dirTags[i];
		var changer = '';
				
		pattern = /include(.*?);/gi;
		var apis = dirTag.match(pattern);
			
		for(j in apis) {
			var api = apis[j].replace(/ /gi, '').replace('include(', '').replace(');', '');			
			var url = require('url').parse(api);
					
			api = require('fs').readFileSync(vhost[url.port][url.hostname]['dir'] + url.pathname);
			
			api = exports.map(
				vhost[url.port][url.hostname]['dir'] + url.pathname, 
				require('fs').readFileSync(vhost[url.port][url.hostname]['dir'] + url.pathname)
			);
			
			changer += api;
		}
		
		result = result.replace(dirTags[i], changer);
	}
		
	return result;
}