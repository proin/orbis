exports.parse = function(global, request, response, session, window, keys, idx, callback) {
	callback('api', { print : global.query });
}