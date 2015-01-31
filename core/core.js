exports.start = function () {
    if (require('path').existsSync('./session') == false)
        require('fs').mkdirSync('./session');

    global.HOME_DIR = __dirname;

    global.server = require('./server.js');

    global.config = {
        vhost: function () {
            return JSON.parse(require('fs').readFileSync('./config/vhost.json') + '');
        }
    };

    global.module = {
        session: require('./session.js'),
        filter: {
            handle: function (server) {
                require('./filter.js').handle(server);
            },
            api: require('./filter/api.js'),
            apiDoc: require('./filter/apidoc.js'),
            stream: require('./filter/stream.js'),
            orbis: {
                filter: function (server, session, callback) {
                    require('./filter/orbis/core.js').filter(server, session, callback);
                },
                api: require(global.HOME_DIR + "/filter/orbis/role/api.js"),
                auth: require(global.HOME_DIR + "/filter/orbis/role/auth.js"),
                template: require(global.HOME_DIR + "/filter/orbis/role/template.js"),
                query: require(global.HOME_DIR + "/filter/orbis/role/query.js"),
                session: require(global.HOME_DIR + "/filter/orbis/role/session.js")
            }
        },
        database: require('./database/controller.js')
    };

    for (port in config.vhost()) {
        server.start(port);
    }
}

String.prototype.startsWith = function (suffix) {
    return !(this.indexOf(suffix) !== 0);
};

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};