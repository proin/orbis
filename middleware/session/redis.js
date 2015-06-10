var redis = require("redis"),
    client;

exports.prefix = 'orbis-uuid-';

var __prefix = 'uuid-';

exports.start = function (server, callback) {
    __prefix = exports.prefix;

    client = redis.createClient();

    var conf = server.vhost.middleware;
    if (!conf.session) conf.session = {};
    if (!conf.session.expired) conf.session.expired = '1w';
    if (typeof conf.session.expired == 'string') {
        conf.session.expired = conf.session.expired.replace('s', '*1000*');
        conf.session.expired = conf.session.expired.replace('m', '*60*1000*');
        conf.session.expired = conf.session.expired.replace('h', '*60*60*1000*');
        conf.session.expired = conf.session.expired.replace('d', '*24*60*60*1000*');
        conf.session.expired = conf.session.expired.replace('w', '*7*24*60*60*1000*');
        if (!conf.session.host) conf.session.host = server.hostname;

        var tmp = conf.session.expired.split('*');
        conf.session.expired = 1;
        for (var i = 0; i < tmp.length; i++)
            conf.session.expired *= (tmp[i].length > 0 ? tmp[i] : '1');
    }

    checkSession(server, function (session) {
        client.quit();

        session.set = function (key, val) {
            session.storage[key] = val;
            var _c = redis.createClient();
            _c.set(__prefix + session.uuid, JSON.stringify(session), function () {
                _c.send_command('expire', [__prefix + session.uuid, session.expired], function () {
                    _c.quit();
                });
            });
        };

        session.get = function (key) {
            return session.storage[key];
        };

        session.del = function (key) {
            delete session.storage[key];
            var _c = redis.createClient();
            _c.set(__prefix + session.uuid, JSON.stringify(session), function () {
                _c.send_command('expire', [__prefix + session.uuid, session.expired], function () {
                    _c.quit();
                });
            });
        };

        callback(session);
    });
}

function checkSession(server, callback) {
    var session = {}
    var session_host = '';
    if (server.vhost.middleware.session.host) session_host = server.vhost.middleware.session.host;
    else session_host = server.hostname;

    var uuid = server.cookies.uuid;

    if (uuid != null) {
        // find session value
        client.get(__prefix + uuid, function (err, reply) {
            // if exists in redis, callback session
            if (reply) {
                session = JSON.parse(reply);
                if (session.host == session_host) {
                    client.send_command('expire', [__prefix + uuid, session.expired], function () {
                        callback(session);
                    });
                    return;
                }
            }

            // create session
            createSession(server, callback);
        });
        return;
    }

    createSession(server, callback);
}

function createSession(server, callback) {
    var session = {};
    var session_host = '';
    if (server.vhost.middleware.session.host) session_host = server.vhost.middleware.session.host;
    else session_host = server.hostname;

    createUUID(function (uuid) {
        session.uuid = uuid;
        session.host = session_host;
        session.port = server.port;
        session.date = new Date().toString();
        session.expired = server.vhost.middleware.session.expired / 1000;
        session.storage = {};

        client.set(__prefix + uuid, JSON.stringify(session), function () {
            client.send_command('expire', [__prefix + uuid, session.expired], function () {
                server.response.setHeader("Set-Cookie", ['uuid=' + uuid + '; Domain=' + session.host + '; Path=/']);
                callback(session);
            });
        });
    });
}

function createUUID(callback) {
    var uuid = require('node-uuid').v4();
    client.get(__prefix + uuid, function (err, reply) {
        if (reply) createUUID(callback);
        else callback(uuid);
    });
}