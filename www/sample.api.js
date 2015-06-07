exports.doc = {
    description: 'API Sample',
    params: {
        "id": "user id", // this is essential query
        "pw": "user pw (optional)" // if writes '(optional)', this query will be optional.
    },
    response: {
        code: {
            '200': 'success',
            '404': 'unexpected request',
            '202': 'unauthorized access'
        },
        data: 'requested params'
    }
}

/**
 * database connection config.
 * you can use 'mysql' or 'mongodb' by writing db at type.
 *
 * @type {{type: string, host: string, port: string, database: string, user: string, password: string}}
 */
exports.db = {
    type: "mysql",
    host: "host address",
    port: "port(3306)",
    database: 'database name',
    user: 'database id',
    password: 'database pw'
};

/**
 * select one of them, you use.
 * AUTO is allow request from both GET and POST method.
 *
 * @type {string}
 */
exports.method = 'GET/POST/AUTO';

/**
 * write something your own logics.
 * you can use middlewares and database in this function.
 * must call 'callback' function at last.
 *
 * @param server
 * @param callback
 */
exports.result = function (server, callback) {

    // this is session middleware. you can use very easily likes below.
    var session = server.middleware.session;
    session.get('key');
    session.edit('key', 'value');
    session.remove('key');

    // same use of node.js 'mysql' or 'mongodb' module.
    var db = server.db;
    db.query('select * from table;', function (err, row) {
        if (err) {
            callback({
                type: 'text/html; charset=utf-8',
                result: JSON.stringify(err)
            });
            return;
        }

        // return result using callback.
        callback({
            type: 'text/html; charset=utf-8',
            result: JSON.stringify(row)
        });
    });
}
