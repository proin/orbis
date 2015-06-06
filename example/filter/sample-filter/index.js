exports.start = function (server, callback) {
    // server object contains about information about connection.

    server.host; // vhost mapped host. if connection's host is not in vhost, this changed to 0.0.0.0 (default)
    server.hostname; // connection's original host
    server.lang; // connection's language
    server.method; // connection's method
    server.path; // connection's path
    server.query; // connection's query

    server.web_dir; // web root dirctory
    server.web_doc_index; // this is array of document indexes
    server.web_file; // current connection's file path
    server.filter; // object about vhost filter information.

    server.middleware; // middleware object. you can use middlewares object.
    server.middleware.session.get('key'); // how to use session objects.

    // callback function for return result. src is printed to clients.
    callback({code: 200, type: 'text/html', src: 'sample-filter-result'});
}