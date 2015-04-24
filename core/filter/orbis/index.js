exports.filter = function (server, session) {
    var orbis = {
        api: require(global.HOME_DIR + "/filter/orbis/role/api.js"),
        auth: require(global.HOME_DIR + "/filter/orbis/role/auth.js"),
        template: require(global.HOME_DIR + "/filter/orbis/role/template.js"),
        query: require(global.HOME_DIR + "/filter/orbis/role/query.js"),
        session: require(global.HOME_DIR + "/filter/orbis/role/session.js"),
        trans: require(global.HOME_DIR + "/filter/orbis/role/trans.js")
    }

    var orbisScriptVariable = {};

    var orbisAttr = function (data) {
        var re = /orbis-attr="(.*?)"/gim;
        var finded = re.exec(data);
        if (finded == null) {
            exports.response(server, 200, data);
            return;
        }

        var attrs = orbisScriptVariable.attr[finded[1]];
        if (attrs == null || typeof attrs != 'object') {
            if (typeof attrs == 'string') data = data.replace(finded[0], attrs);
            else data = data.replace(finded[0], '');
        } else {
            var replacement = '';
            Object.keys(attrs).forEach(function (key) {
                if (typeof attrs[key] == 'string')
                    replacement += key.replace(/"/gi, '') + '="' + attrs[key].replace(/"/gi, '') + '" ';
            });
            data = data.replace(finded[0], replacement);
        }
        orbisAttr(data);
    }

    var orbisScript = function (data, script) {
        var re = /<script role="orbis">(.*?)<\/?script>/gim;
        var finded = re.exec(data);
        if (finded == null) {
            try {
                var mscript = 'var orbis = {};' + 'orbis.attr = {};' + script + '\nexports.orbis = orbis;';
                var Module = module.constructor;
                var m = new Module();
                m._compile(mscript);

                Object.keys(m.exports.orbis).forEach(function (key) {
                    orbisScriptVariable[key] = m.exports.orbis[key];
                });
            } catch (e) {
            }
            orbisAttr(data);
            return;
        }

        script += '\n' + finded[1];
        data = data.replace(finded[0], '');
        orbisScript(data, script);
    }

    var orbisTag = function (data) {
        data = data.replace(/  /g, ' ');
        data = data.replace(/\t/g, '');
        data = data.replace(/\n/g, '');

        var re = /<orbis.*?role="(.*?)".*?>(.*?)<\/?orbis>/gim;
        var finded = re.exec(data);
        if (finded == null) {
            orbisScript(data, '');
            return;
        }

        var role = finded[1];
        if (role == 'api') {
            orbis.api.parse(server, session, finded[0], function (result) {
                re = /<orbis.*?name="(.*?)".*?<\/?orbis>/gim;
                var valueName = re.exec(finded[0]);
                valueName = valueName == null ? 'apiResult' : valueName[1];
                data = data.replace(finded[0], '<script type="text/javascript">var ' + valueName + '=' + JSON.stringify(result) + '</script>');
                orbisTag(data);
            });
        } else if (role == 'auth') {
            orbis.auth.parse(server, session, finded[0], function (auth, result) {
                if (auth == false) data = data.replace(/<body.*?<\/?body>/gim, '<body>' + result + '</body>');
                else data = data.replace(finded[0], result);
                orbisTag(data);
            });
        } else if (role == 'template') {
            orbis.template.parse(server, session, finded[0], function (result) {
                data = data.replace(finded[0], result);
                orbisTag(data);
            });
        } else if (role == 'query') {
            orbis.query.parse(server, session, finded[0], function (result) {
                data = data.replace(finded[0], result);
                orbisTag(data);
            });
        } else if (role == 'session') {
            orbis.session.parse(server, session, finded[0], function (result) {
                data = data.replace(finded[0], result);
                orbisTag(data);
            });
        } else if (role == 'trans') {
            orbis.trans.parse(server, session, finded[0], function (result) {
                data = data.replace(finded[0], result);
                orbisTag(data);
            });
        } else {
            data = data.replace(finded[0], '');
            orbisTag(data);
        }
    };

    var fs = require('fs');
    data = fs.readFile(server.vhost.dir + server.path, function (err, data) {
        if (err) {
            exports.response(server, 500, err);
            return;
        }
        data += '';
        orbisTag(data);
    });
}

exports.response = function (server, code, result) {
    if (code == 200) {
        server.response.writeHead(code, {'Content-Type': 'text/html; charset=UTF-8'});
        server.response.end(result);
    } else {
        server.printError(code, result);
    }
}