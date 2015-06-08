// import orbis module
var orbis = require('../orbis');

// additional filter
orbis.filter('sample-filter', require('./example/filter/sample-filter'));

// additional middleware
orbis.middleware('sample-middleware', require('./example/middleware/sample-middleware'));

// set virtual hosts
orbis.vhost({
    host: 'orbis.local.com', // host like this
    port: '80', // port
    dir: '$home/www', // $home replace with root directory of orbis installed. or you must use absolute path.
    index: ['index.html', 'index.htm'],
    filter: {
        startsWith: {
            '/doc': 'apidoc'
        },
        endsWith: {
            '.api.js': 'api', // set suffix of path name and filter name that you want to mapping.
            '.api': 'api',
            '.php': 'php'
        }
    },
    middleware: {
        session: {
            expired: '1w'
        }
    }
});

orbis.vhost({
    host: 'orbis.local.com', // host like this
    port: 'https', // 'https' and 'http' replace with '443' and '80'
    dir: '$home/www', // $home replace with root directory of orbis installed. or you must use absolute path.
    index: ['index.php', 'index.html'],
    filter: {
        startsWith: {
            '/doc': 'apidoc'
        },
        endsWith: {
            '.api.js': 'api', // set suffix of path name and filter name that you want to mapping.
            '.api': 'api',
            '.php': 'php'
        }
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