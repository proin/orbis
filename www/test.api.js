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

exports.result = function ($query, $middleware, $response) {
    var session = $middleware.session;

    session.set('q', $query.q);

    $response({
        type: 'text/html; charset=utf-8',
        result: JSON.stringify(session.get('q'))
    });
};