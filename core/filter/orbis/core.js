exports.filter = function (server, session, callback) {
    var fs = require('fs');
    data = fs.readFileSync(server.vhost.DIR + server.path) + '';

    var orbisApi = function (server, session, data, callback) {
        data += '';

        data = data.replace(/\n/g, '');
        data = data.replace(/<!--.*?-->/gim, '');

        var fs = require('fs');

        var re = /<orbis.*?role="(.*?)".*?<\/?orbis>/gim;
        var finded = re.exec(data);
        if (finded == null) {
            callback(200, data);
            return;
        }

        var role = finded[1];

        if (role == 'api') {
            global.module.filter.orbis.api.parse(server, session, finded[0], function (result) {
                re = /<orbis.*?name="(.*?)".*?<\/?orbis>/gim;
                var valueName = re.exec(finded[0]);
                valueName = valueName == null ? 'apiResult' : valueName[1];
                data = data.replace(finded[0], '<script type="text/javascript">var ' + valueName + '=' + JSON.stringify(result) + '</script>');
                orbisApi(server, session, data, callback);
            });
        } else if (role == 'auth') {
            global.module.filter.orbis.auth.parse(server, session, finded[0], function (auth, result) {
                if (auth == false) data = data.replace(/<body.*?<\/?body>/gim, '<body>' + result + '</body>');
                else data = data.replace(finded[0], result);
                orbisApi(server, session, data, callback);
            });
        } else if (role == 'template') {
            global.module.filter.orbis.template.parse(server, session, finded[0], function (result) {
                data = data.replace(finded[0], result);
                orbisApi(server, session, data, callback);
            });
        } else if (role == 'query') {
            global.module.filter.orbis.query.parse(server, session, finded[0], function (result) {
                data = data.replace(finded[0], result);
                orbisApi(server, session, data, callback);
            });
        } else if (role == 'session') {
            global.module.filter.orbis.session.parse(server, session, finded[0], function (result) {
                data = data.replace(finded[0], result);
                orbisApi(server, session, data, callback);
            });
        } else {
            data = data.replace(finded[0], '');
            orbisApi(server, session, data, callback);
        }
    };

    orbisApi(server, session, data, callback);
}