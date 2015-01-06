exports.start = function() {
	if(require('path').existsSync('./session') == false)
		require('fs').mkdirSync('./session');

	var global = {
		config : {
			vhost : function() {
				return JSON.parse(require('fs').readFileSync('./config/vhost.json')+'');
			}
		},
		module : {
			filter : {
				session : require('./filter/session.js'),
				api : require('./filter/loadAPI.js'),
				apiDoc : require('./filter/apiDoc.js'),
				stream : require('./filter/loadStream.js')
			},
			database : require('./database/controller.js')
		}
	}

	for( port in global.config.vhost() ) {
		global.port = port;
		require('./server.js').start(global);
	}
}