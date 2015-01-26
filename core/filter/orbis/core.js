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
    query: require(global.homeDir + "/filter/orbis/role/query.js"),
    session: require(global.homeDir + "/filter/orbis/role/session.js")
  }

  var fs = require('fs');

  var jsdom = require('jsdom');
  var jquery = fs.readFileSync(global.homeDir + '/libs/jquery.js');

  jsdom.env({
    html: data,
    src: [jquery],
    done: function (errors, window) {
      var $ = window.$;

      if($('orbis').length == 0) {
        callback($('html').html());
        return;
      }

      var object = $('orbis').first();
      var role = object.attr('role');
      if(orbis[role] != null) {
        orbis[role].parse(
          global,
          request,
          response,
          session,
          object,
          function(roleType, data) {
            if(roleType=='api') {
              var valName = '';
              var replaceString = '';
              if(object.attr('value') != null) {
                valName = object.attr('value');
                replaceString = '<script type="text/javascript">var ' + valName + ' = ' + JSON.stringify(data.print) + '</script>';
              }
              object.replaceWith(replaceString);
            } else if(roleType=='auth') {
              if(data.allow == false) {
                $('body').html(data.print);
                callback($('html').html());
                return;
              } else {
                object.replaceWith(data.print);
              }
            } else if(roleType=='template') {
              object.replaceWith(data.data);
            } else if(roleType=='query' || roleType=='session') {
              var replaceString = '';
              if(object.attr('type') != null) {
                if(object.attr('type') == 'javascript' && object.attr('key') == null) {
                  var valName = roleType;
                  if(object.attr('value') != null) {
                    valName = object.attr('value');
                  }
                  replaceString = '<script type="text/javascript">var ' + valName + ' = ' + JSON.stringify(data.print) + '</script>';
                } else if(object.attr('type') == 'javascript' && object.attr('key') != null) {
                  var valName = roleType;
                  if(object.attr('value') != null) {
                    valName = object.attr('value');
                  }
                  var queryKey = object.attr('key');
                  if(data.print[queryKey] != null) {
                    replaceString = '<script type="text/javascript">var ' + valName + ' = ' + JSON.stringify(data.print[queryKey]) + '</script>';
                  }
                } else if(object.attr('type') == 'html' && object.attr('key') == null) {
                  replaceString = JSON.stringify(data.print);
                } else if(object.attr('type') == 'html' && object.attr('key') != null) {
                  var queryKey = object.attr('key');
                  if(data.print[queryKey] != null) {
                    if(typeof data.print[queryKey] == 'string') {
                      replaceString = data.print[queryKey];
                    } else {
                      replaceString = JSON.stringify(data.print[queryKey]);
                    }
                  }
                }
              }
              object.replaceWith(replaceString);
            } else {
              object.replaceWith('');
            }
            exports.orbisApi(global, request, response, session, $('html').html(), callback);
          }
        );
      } else {
        object.replaceWith('');
        exports.orbisApi(global, request, response, session, $('html').html(), callback);
      }
    }
  });
}
