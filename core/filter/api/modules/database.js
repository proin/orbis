exports.connect = function (config, callback) {
    if (config == null || config.type == null) {
        callback(true, null);
        return;
    }

    switch (config.type) {
        case 'mongodb' :
            var client = require('mongodb').MongoClient;
            client.connect("mongodb://" + config.host + ":" + config.port + "/" + config.database, function (err, db) {
                callback(err, db);
            });
            break;
        case 'mysql' :
            var connection = require('mysql').createConnection({
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
                database: config.database
            });

            connection.connect(function (err) {
                callback(err, connection);
            });
            break;
    }
}

exports.close = function (config, db) {
    switch (config.type) {
        case 'mongodb' :
            db.close();
            break;
        case 'mysql' :
            db.end();
            break;
    }
}