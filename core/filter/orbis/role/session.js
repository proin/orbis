exports.parse = function(global, request, response, session, object, callback) {
	callback('session', { print : session });
}
