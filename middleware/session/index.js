exports.redis = false;
exports.redis_prefix = 'orbis-session-prefix-';

exports.session_path = __home + '/session';

exports.start = function (server, callback) {
    if (exports.redis) {
        var redis = require('./redis.js');
        redis.prefix = exports.redis_prefix;
        redis.start(server, callback);
    } else {
        var embed = require('./embed.js');
        embed.session_path = exports.session_path;
        embed.start(server, callback);
    }
}