exports.parse = function (server, session, object, callback) {
    var re = /<orbis.*?allow="(.*?)".*?<\/?orbis>/gim;
    var allow = re.exec(object);
    if (allow == null) {
        callback(true, '');
        return;
    }
    allow = require('querystring').parse(allow[1]);

    re = /<deny.*?>(.*?)<\/?deny>/gim;
    var deniedMsg = re.exec(object);
    deniedMsg = deniedMsg == null ? '' : deniedMsg[1];

    re = /<allow.*?>(.*?)<\/?allow>/gim;
    var allowedMsg = re.exec(object);
    allowedMsg = allowedMsg == null ? '' : allowedMsg[1];

    var auth = false;

    Object.keys(allow).forEach(function (key) {
        if (session[key] != null) {
            var allowed = [allow[key]];
            if (allow[key].indexOf(',') != -1) {
                allowed = allow[key].split(',');
            }

            for (var i = 0; i < allowed.length; i++) {
                if (session[key] == allowed[i]) {
                    auth = true;
                } else if (allowed[i].length == 0) {
                    auth = true;
                }
            }

        }
    });

    callback(auth, auth ? allowedMsg : deniedMsg);
}
