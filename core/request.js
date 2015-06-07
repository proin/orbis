exports.start = function (server, callback) {
    var request = server.request;
    // Extract Cookies
    server.cookies = {};
    var cookiesArr = request.headers.cookie;
    if (cookiesArr == null) cookiesArr = [];
    else cookiesArr = cookiesArr.split(';');
    for (var i = 0; i < cookiesArr.length; i++) {
        var key = cookiesArr[i].split('=')[0].replace(/ /gi, '');
        var val = cookiesArr[i].split('=')[1];
        server.cookies[key] = val;
    }

    server.vhost = server.vhost[server.host];

    // Extract Request Queries
    if (request.method == 'GET') {
        server.query = require('url').parse(request.url, true).query;
        callback();
    } else if (request.method == 'POST') {
        var body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            body = decodeURI(body);
            server.query = require('querystring').parse(body);
            callback();
        });
    }
};