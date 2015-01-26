exports.parse = function(global, request, response, session, object, callback) {
	var allow = require('querystring').parse(object.attr('allow'));
	var deniedMsg = object.find('deny').html();
	var allowedMsg = object.find('allow').html();

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

	if(auth) {
		callback('auth', { allow : auth, print : allowedMsg });
	} else {
		callback('auth', { allow : auth, print : deniedMsg });
	}
}
