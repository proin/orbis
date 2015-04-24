exports.start = function () {
    if (require('fs').existsSync('./session') == false)
        require('fs').mkdirSync('./session');

    global.HOME_DIR = __dirname;
    global.server = require('./server.js');
    global.config = {
        orbis: function () {
            var config = require('fs').readFileSync('./config/orbis-config.json') + '';
            config = config.replace(/\$ORBIS_HOME/gim, __dirname.substring(0, __dirname.length - 5));
            var result = JSON.parse(config);
            return result;
        },
        vhost: function () {
            var config = require('fs').readFileSync('./config/vhost.json') + '';
            config = config.replace(/\$ORBIS_HOME/gim, __dirname.substring(0, __dirname.length - 5));
            var result = JSON.parse(config);
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