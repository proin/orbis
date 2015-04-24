exports.handle = function (server) {
    if (server.query.lang)
        server.lang = server.query.lang + ',' + server.lang;

    var filters = server.filters;

    if (server.vhost['hidden-path'] != null)
        for (var i = 0; i < server.vhost['hidden-path'].length; i++)
            if (server.path.indexOf(server.vhost['hidden-path'][i]) == 0 || server.path.indexOf(server.vhost['hidden-path'][i]) == 1) {
                server.printError(404, "Page Not Found");
                return;
            }

    global.module.session.start(server, function (session) {
        for (filter in server.vhost.filter) {
            for (i in server.vhost.filter[filter]) {
                var filterext = server.vhost.filter[filter][i];
                if (filterext.startsWith('.') && server.path.endsWith(filterext)) {
                    filters[filter].filter(server, session, filterext);
                    return;
                } else if (filterext.startsWith('.') == false && server.path.startsWith(filterext)) {
                    filters[filter].filter(server, session, filterext);
                    return;
                }
            }
        }

        filters.stream.filter(server, session);
    });
}