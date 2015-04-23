exports.start = function (server, callback) {
    var cookies = new Object();

    var cookiesArr = server.request.headers.cookie;
    if (cookiesArr == null) cookiesArr = [];
    else cookiesArr = cookiesArr.split(';');

    for (var i = 0; i < cookiesArr.length; i++) {
        var key = cookiesArr[i].split('=')[0].replace(/ /gi, '');
        var val = cookiesArr[i].split('=')[1];
        cookies[key] = val;
    }

    var hostname = server.vhost['session-with'];
    if (hostname == null) hostname = server.host;

    var fs = require('fs');
    var uuid = cookies.uuid;
    var session = exports.checkUUID(server, hostname, uuid);

    var sessionFilePath = './session/_' + hostname + '/' + uuid + ".json";

    session.edit = function (key, val) {
        if (key == 'hostname' || key == 'uuid') return session;
        session[key] = val;
        require('fs').writeFileSync(
            sessionFilePath,
            JSON.stringify(session)
        );
        return session;
    };

    session.remove = function (key) {
        if (key == 'hostname' || key == 'uuid') return session;
        delete session[key];
        require('fs').writeFileSync(sessionFilePath, JSON.stringify(session));
        return session;
    };

    callback(session);
}

exports.checkUUID = function (server, hostname, preUUID) {
    var fs = require('fs');

    var hostHome = './session/_' + hostname;
    if (require('fs').existsSync(hostHome) == false)
        fs.mkdirSync(hostHome);

    var sessionInfo = {};

    if (preUUID != null && require('fs').existsSync(hostHome + '/' + preUUID + '.json')) {
        sessionInfo = JSON.parse(fs.readFileSync(hostHome + '/' + preUUID + '.json'));

        var sessionDate = new Date(sessionInfo.date);
        var now = new Date();
        var diff = now - sessionDate;

        if (diff < server.vhost['session-expire']) {
            sessionInfo.date = new Date().toString();
            fs.writeFileSync(hostHome + '/' + preUUID + '.json', JSON.stringify(sessionInfo));
            return JSON.parse(fs.readFileSync(hostHome + '/' + preUUID + '.json'));
        } else {
            fs.unlinkSync(hostHome + '/' + preUUID + '.json', JSON.stringify(sessionInfo));
        }
    }

    var uuid = require('node-uuid').v4();
    while (require('fs').existsSync(hostHome + '/' + uuid + '.json') == true)
        uuid = require('node-uuid').v4();

    sessionInfo.uuid = uuid;
    sessionInfo.host = hostname;
    sessionInfo.date = new Date().toString();

    fs.writeFileSync(hostHome + '/' + uuid + '.json', JSON.stringify(sessionInfo));

    server.response.setHeader("Set-Cookie", ['uuid=' + uuid + '; Domain=' + hostname + '; Path=/']);
    return sessionInfo;
}
