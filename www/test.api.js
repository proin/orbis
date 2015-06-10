exports.doc = {
    description: 'API Sample',
    params: {
        "q": "query"
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

exports.method = 'GET';

exports.result = function (server, callback) {
    var query = server.query;
    var session = server.middleware.session;

    callback({
        type: 'text/html; charset=utf-8',
        result: JSON.stringify(session.get('q'))
    });
}
