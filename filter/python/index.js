exports.start = function (server, callback) {
    if (server.result.code == 404) {
        callback();
        return;
    }

    var spawn = require('child_process').spawn;
    var params = [server.web_file];
    if (server.query['argv']) {
        var argvs = server.query['argv'].split(' ');
        for (var i = 0; i < argvs.length; i++)
            params.push(argvs[i]);
    }
    var python = spawn('python', params);

    python.stdout.on('data', function (data) {
        var result = data + '';
        callback({code: 200, type: 'text/html', src: result, finalize: true});
    });

    python.stderr.on('data', function (data) {
        callback({code: 200, type: 'text/html', src: data + '', finalize: true});
    });

    python.on('close', function (code) {
    });
};