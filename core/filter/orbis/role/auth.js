exports.parse = function(global, request, response, session, window, keys, idx, callback) {
	var $ = window.$;
	var allow = require('querystring').parse($('[orbis-id="' + keys[idx] + '"]').attr('allow'));
	var deniedMsg = $('[orbis-id="' + keys[idx] + '"]').html();
	
	var auth = false;

	Object.keys(allow).forEach(function(key) {
		if(session[key] != null) {
			var allowed = [ allow[key] ];
			if(allow[key].indexOf(',') != -1) {
				allowed = allow[key].split(',');
			}

			for(var i=0;i<allowed.length;i++) {
				if(session[key] == allowed[i]) {
					auth = true;
				} else if(allowed[i].length == 0) {
					auth = true;
				}
			}
			
		}
	});

	callback('auth', { allow : auth, print : deniedMsg });
}