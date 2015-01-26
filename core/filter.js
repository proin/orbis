exports.handle = function (global, request, response) {
  global.module.session.start(
    global,
    request,
    response,
    function (session) {
      var apiExt = global.vhost[global.port][global.host]['api-ext'];
      var orbisExt = global.vhost[global.port][global.host]['orbis-ext'];

      if (global.path.indexOf(apiExt, global.path.length - apiExt.length) !== -1) {
        global.module.filter.api.filter(global, request, response, session, function(code, data) {
          response.writeHead(200, { 'Content-Type': 'text/json; charset=UTF-8' });
          response.end(JSON.stringify({code: code, data: data}), 'UTF-8');
        });
      } else if (global.path == global.vhost[global.port][global.host]['api-doc']) {
        global.module.filter.apiDoc.filter(global, request, response, session);
      } else if (global.path.indexOf(orbisExt, global.path.length - orbisExt.length) !== -1) {
        global.module.filter.orbis.filter(global, request, response, session);
      } else {
        global.module.filter.stream.filter(global, request, response, session);
      }
    }
  );
}
