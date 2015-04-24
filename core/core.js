exports.start = function () {
    if (require('fs').existsSync('./session') == false)
        require('fs').mkdirSync('./session');

    global.HOME_DIR = __dirname;
    global.server = require('./server.js');
    global.config = {
        vhost: function () {
            var result = JSON.parse(require('fs').readFileSync('./config/vhost.json') + '');
            for (port in result) {
                var hosts = false;
                for (host in result[port]) {
                    if (result[port][host].activation == null)
                        result[port][host].activation = true;
                    if (result[port][host].activation)
                        hosts = true;
                    else
                        delete result[port][host];
                }

                if (!hosts) delete result[port];
            }
            return result;
        }
    };

    global.module = {
        session: require('./session.js'),
        filter: require('./filter.js')
    };

    var vhost = config.vhost();
    for (port in vhost) {
        server.start(port, vhost[port].ssl);
    }
}

String.prototype.startsWith = function (suffix) {
    return !(this.indexOf(suffix) !== 0);
};

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};