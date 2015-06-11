// import orbis module
var orbis = require('../orbis');

// additional filter
orbis.filter('sample-filter', require('./example/filter/sample-filter'));

// additional middleware
orbis.middleware('sample-middleware', require('./example/middleware/sample-middleware'));

// to use redis for session saving @ session middleware
// install redis in your system before set this option
// refer to http://redis.io/download
// by default, this option is false. (use file system for session saving)
orbis.middleware('session').redis = true;

// set virtual hosts
orbis.vhost({
    host: '127.0.0.1', // allowed host
    port: '80', // port
    dir: '$home/www', // $home replace with root directory of orbis installed. or you must use absolute path.
    index: ['index.html', 'index.htm'],
    // filter: {
    //     "filter-name": js-regular-expression or [ js-regular-expression ]
    // }
    filter: {
        api: [
            /.api.js$/gim,
            /.api$/gim
        ],
        apidoc: [
            /^\/docs/gim
        ],
        php: /.php$/gim,
        python: /.py$/gim
    },
    middleware: {
        session: {
            expired: '1w'
        }
    }
});

orbis.vhost({
    host: '127.0.0.1', // allowed host
    port: 'https', // 'https' and 'http' replace with '443' and '80'
    dir: '$home/www', // $home replace with root directory of orbis installed. or you must use absolute path.
    index: ['index.php', 'index.html'],
    filter: {
        api: [
            /.api.js$/gim,
            /.api$/gim
        ],
        apidoc: [
            /^\/docs/gim
        ],
        php: [
            /.php$/gim
        ]
    },
    middleware: {
        session: {
            expired: '1w',
            host: '.local.com'
        }
    }
});

// ssl options. 'port', 'key path', 'certification path'.
orbis.ssl('https', './ssl/key.pem', './ssl/server.crt');

// orbis start.
orbis.start();