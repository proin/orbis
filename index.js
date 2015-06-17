require('./core/prototypes.js');

global.__version = '0.2.5';
global.__home = __dirname;
global.__vhost = {};
global.__ssl = {};
global.__filters = {
    api: require(__home + '/filter/api'),
    apidoc: require(__home + '/filter/apidoc'),
    php: require(__home + '/filter/php'),
    python: require(__home + '/filter/python')
};
global.__middlewares = {
    session: require(__home + '/middleware/session'),
    php: require(__home + '/middleware/php'),
    database: require(__home + '/middleware/database')
};

/**
 *
 * @param port: port to apply ssl
 * @param key: ssl key path, './ssl/key.pem' is default
 * @param cert: ssl certification path, './ssl/certification.crt' is default
 */
exports.ssl = function (port, key, cert) {
    if (port == null) return;
    if (port == 'http') port = 80;
    if (port == 'https') port = 443;

    if (!__ssl[port]) __ssl[port] = {};
    __ssl[port].key = (key ? key : __ssl[port].key ? __ssl[port].key : __home + '/ssl/key.pem');
    __ssl[port].cert = (cert ? cert : __ssl[port].cert ? __ssl[port].cert : __home + '/ssl/certification.crt');
};

/**
 * middleware module must have start function.
 * start function has 'server' and 'callback' parameters.
 * start function's callback function must return result string.
 * for more detail, refer session middleware in '/middleware/session/index.js'.
 *
 * @param name: middleware name
 * @param module: middleware module
 */
exports.middleware = function (name, module) {
    if (!module) {
        if (__middlewares[name])
            return __middlewares[name];
        return;
    }

    if (!module.start) return;
    __middlewares[name] = module;
};

/**
 * filter module must have start function.
 * start function has 'server' and 'callback' parameters.
 * start function's callback function must return result string.
 * for more detail, refer api filter in '/filter/api/index.js'.
 *
 * @param name: filter name
 * @param module: filter module
 */
exports.filter = function (name, module) {
    if (!module.start) return;
    __filters[name] = module;
};

/**
 *
 * @param conf = {
 *      port: port number(integer),             # default is 5000
 *      host: 'your domain name',               # 0.0.0.0 is default
 *      dir: '/web/root/directory',             # must be absolute path, $home is replaced to orbis home directory
 *      index: [ 'index.html', 'index.php' ],   # document index array
 *      error: {                                # error page information
 *          404: '/web/error/page.html'         # error number & print page path
 *      },
 *      session: {
 *          dir: '/session/dir',                # path for saving sessions
 *          expired: '1d12h'                    # session due time, input 1w, 1d, 1h, 1m, 1s or microseconds
 *      },
 *      filter: {                               # set extensions to filter middleware, all file is set stream middleware default
 *          'file extension': 'filter middleware name',
 *          'html': 'stream',
 *          'php': 'php'
 *      }
 *  }
 */
exports.vhost = function (conf) {
    // Web Server Config
    if (!conf.port) conf.port = 5000;
    if (conf.port == 'http') conf.port = 80;
    if (conf.port == 'https') conf.port = 443;

    if (!conf.host) conf.host = '0.0.0.0';
    if (!conf.dir) conf.dir = __home + '/web';
    conf.dir = conf.dir.replace(/\$home/gim, __home);

    // Document Index Config
    if (!conf.index) conf.index = ['index.html', 'index.htm'];
    if (typeof conf.index != 'object') conf.index = [conf.index];

    // Middleware Config
    if (!conf.middleware) conf.middleware = {};

    // Filter Middleware Config
    if (!conf.filter) conf.filter = {};

    // Add Default Config
    if (!__vhost [conf.port])
        __vhost[conf.port] = {
            '0.0.0.0': conf
        };

    // Add Config
    if (!__vhost[conf.port][conf.host]) __vhost[conf.port][conf.host] = {};
    __vhost[conf.port][conf.host] = conf;
};

/**
 * web engine start. before you start function, please set up all configurations.
 */
exports.start = function () {
    var orbis = require('./core/core.js');
    orbis.start();
};