exports.connect = function(config, callback) {
	if(config == null || config.type == null) {
		callback(true, null);
	}

	switch(config.type) {
		case 'mongodb' : 
			var client = require('mongodb').MongoClient;
			client.connect("mongodb://" + config.host + ":"+ config.port + "/" + config.database , function(err, db) {
				callback(err, db);
			});
			return;
		case 'mysql' : 
			var connection = require('mysql').createConnection({
				host : config.host,
				port : config.port,
				user : config.user,
				password : config.password,
				database : config.database
			});
			
			connection.connect(function(err) {
				callback(err, connection);
			});
			return;
	}
}