/**
 * php filter.
 * this is not completed.
 * be careful to use.
 *
 * @param server
 * @param callback
 */
exports.start = function (server, callback) {
    if (server.result.code == 404) {
        callback();
        return;
    }

    server.middleware.php(function(data) {
        callback({code: 200, type: 'text/html', src: data, finalize: true});
    });
};