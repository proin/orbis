exports.start = function () {
    if (require('fs').existsSync('./session') == false)
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
        filter: require('./filter.js'),
        database: require(global.HOME_DIR + '/database/controller.js')
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