exports.parse = function(global, request, response, session, object, callback) {
	callback('query', { print : global.query });
}
