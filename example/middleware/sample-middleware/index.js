exports.start = function (server, callback) {
    // this object can use at 'api' filter or other filters.
    // you can access this object by session.middleware.middleware-name.
    var sample = {
        data: 'example data'
    };

    callback(sample);
}