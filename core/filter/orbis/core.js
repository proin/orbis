exports.filter = function (global, request, response, session) {
    var fs = require('fs');
    var path = global.path;
    path = global.vhost[global.port][global.host]['dir'] + path;
    data = fs.readFileSync(path);

    exports.orbisApi(global, request, response, session, data, function(result) {
        var print = '<html>\n' + result + '\n</html>';
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(print);
    });    
}

exports.orbisApi = function(global, request, response, session, data, callback) {
    var orbis = {
        api: require(global.homeDir + "/filter/orbis/role/api.js"),
        auth: require(global.homeDir + "/filter/orbis/role/auth.js"),
        template: require(global.homeDir + "/filter/orbis/role/template.js"),
        query: require(global.homeDir + "/filter/orbis/role/query.js")
    }

    var fs = require('fs');

    var jsdom = require('jsdom');
    var jquery = fs.readFileSync(global.homeDir + '/libs/jquery.js');

    jsdom.env({
        html: data,
        src: [jquery],
        done: function (errors, window) {
            var $ = window.$;
            var orbisObjects = [];

            var orbisId = 0;
            var keys = [];
            $('orbis').each(function () {
                $(this).attr('orbis-id', orbisId);
                orbisObjects.push({id: orbisId, object: this});
                keys.push(orbisId);
                orbisId++;
            });

            if(keys.length == 0) {
                callback($('html').html());
                return;
            }

            exports.roleIterator(global, request, response, session, orbis, window, keys, 0, callback);            
        }
    });

}

exports.roleIterator = function(global, request, response, session, orbis, window, keys, idx, callback) {
    var $ = window.$;
    if(keys.length == idx) {
        callback($('html').html());
        return;
    }

    var role = $('[orbis-id="' + keys[idx] + '"]').attr('role');
    if(orbis[role] != null) {
        orbis[role].parse(global, request, response, session, window, keys, idx, function(roleType, data) {
            switch(roleType) {
                case 'api':
                var replaceString = '<script type="text/javascript">var ' + $('[orbis-id="' + keys[idx] + '"]').attr('valName') + ' = ' + JSON.stringify(data.print) + '</script>';
                $('[orbis-id="' + keys[idx] + '"]').replaceWith(replaceString);
                exports.roleIterator(global, request, response, session, orbis, window, keys, idx + 1, callback);
                break;

                case 'auth':
                if(data.allow == false) {
                    $('body').html(data.print);
                    callback($('html').html());
                    return;
                } else {
                    $('[orbis-id="' + keys[idx] + '"]').replaceWith('');
                    exports.roleIterator(global, request, response, session, orbis, window, keys, idx + 1, callback);
                }
                break;

                case 'template':
                $('[orbis-id="' + keys[idx] + '"]').replaceWith(data.data);
                var html = '<html>' + $('html').html() + '</html>';
                exports.orbisApi(global, request, response, session, html, function(result) {
                    callback(result);
                });
                return;

                case 'query':
                var replaceString = '<script type="text/javascript">var ' + $('[orbis-id="' + keys[idx] + '"]').attr('valName') + ' = ' + JSON.stringify(data.print) + '</script>';
                $('[orbis-id="' + keys[idx] + '"]').replaceWith(replaceString);
                exports.roleIterator(global, request, response, session, orbis, window, keys, idx + 1, callback);
                break;
            }
        });
    } else {
        exports.roleIterator(global, request, response, session, orbis, window, keys, idx + 1, callback);
    }
}