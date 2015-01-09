exports.start = function(global, request, response, callback) {
	var cookies = new Object();
	
	var cookiesArr = request.headers.cookie;
	if(cookiesArr == null) cookiesArr = [];
	else cookiesArr = cookiesArr.split(';');

	for(var i = 0; i < cookiesArr.length ; i++) {
		var key = cookiesArr[i].split('=')[0].replace(/ /gi, '');
		var val = cookiesArr[i].split('=')[1];
		cookies[key] = val;
	}
	
	var hostname = global.vhost[global.port][global.host]['session-combine'];
	if(hostname == null)
		hostname = global.host;

	var fs = require('fs');
	var uuid = cookies.uuid;
	var session = exports.checkUUID(global, response, hostname, uuid);

	session.edit = function(key, val) {
		if(key == 'hostname' || key == 'uuid') return session;
		session[key] = val;
		require('fs').writeFileSync(
			sessionFilePath,
			JSON.stringify( session )
			);
		return session;
	};

	session.remove = function(key) {
		if(key == 'hostname' || key == 'uuid') return session;
		delete session[key];
		require('fs').writeFileSync( sessionFilePath , JSON.stringify( session ) );
		return session;
	};

	callback(session);
}

exports.checkUUID = function(global, response, hostname, preUUID) {
	var fs = require('fs');

	var hostHome = './session/_' + hostname;
	if(require('path').existsSync(hostHome) == false)
		fs.mkdirSync(hostHome);

	var sessionInfo = {};

	if(preUUID != null && require('path').existsSync(hostHome + '/' + preUUID + '.json')) {
		sessionInfo = JSON.parse(fs.readFileSync(hostHome + '/' + preUUID + '.json'));

		var sessionExpire = global.vhost[global.port][global.host]['session-expire'];
		if(sessionExpire == null)
			sessionExpire = 3;
		sessionExpire = sessionExpire * 1;

		var sessionDate = new Date(sessionInfo.date);
		var now = new Date();
		var diff = now - sessionDate;

		if(diff < 1000 * 60 * 60 * 24 * sessionExpire) {
			sessionInfo.date = new Date().toString();
			fs.writeFileSync(hostHome + '/' + preUUID + '.json', JSON.stringify(sessionInfo));
			return JSON.parse(fs.readFileSync(hostHome + '/' + preUUID + '.json'));	
		} else {
			fs.unlinkSync(hostHome + '/' + preUUID + '.json', JSON.stringify(sessionInfo));
		}
	}

	var uuid = require('node-uuid').v4();
	while(require('path').existsSync(hostHome + '/' + uuid + '.json') == true)
		uuid = require('node-uuid').v4();

	sessionInfo.uuid = uuid;
	sessionInfo.host = hostname;
	sessionInfo.date = new Date().toString();

	fs.writeFileSync( hostHome + '/' + uuid + '.json' , JSON.stringify( sessionInfo ) );

	response.setHeader("Set-Cookie", ['uuid=' + uuid + '; Domain=' + hostname + '; Path=/']);
	return sessionInfo;
}