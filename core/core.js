exports.start = function () {
    if (require('path').existsSync('./session') == false)
        require('fs').mkdirSync('./session');

    var global = {
        homeDir : __dirname,
        config: {
            vhost: function () {
                return JSON.parse(require('fs').readFileSync('./config/vhost.json') + '');
            }
        },
        module: {
            session: require('./session.js'),
            filter: {
                api: require('./filter/api.js'),
                apiDoc: require('./filter/apidoc.js'),
                stream: require('./filter/stream.js'),
                orbis: require('./filter/orbis/core.js')
            },
            database: require('./database/controller.js')
        }
    }

    for (port in global.config.vhost()) {
        global.port = port;
        require('./server.js').start(global);
    }
}