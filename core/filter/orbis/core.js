exports.filter = function (server, session, callback) {
	var orbisScriptVariable = {};

	var orbisAttr = function (data) {
		data = data.replace(/\n/g, '');
		data = data.replace(/<!--.*?-->/gim, '');

		var re = /orbis-attr="(.*?)"/gim;
		var finded = re.exec(data);
		if (finded == null) {
			callback(200, data);
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
		data = data.replace(/\n/g, '');
		data = data.replace(/<!--.*?-->/gim, '');

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
		data = data.replace(/\n/g, '');
		data = data.replace(/<!--.*?-->/gim, '');

		var re = /<orbis.*?role="(.*?)".*?<\/?orbis>/gim;
		var finded = re.exec(data);
		if (finded == null) {
			orbisScript(data, '');
			return;
		}

		var role = finded[1];

		if (role == 'api') {
			global.module.filter.orbis.api.parse(server, session, finded[0], function (result) {
				re = /<orbis.*?name="(.*?)".*?<\/?orbis>/gim;
				var valueName = re.exec(finded[0]);
				valueName = valueName == null ? 'apiResult' : valueName[1];
				data = data.replace(finded[0], '<script type="text/javascript">var ' + valueName + '=' + JSON.stringify(result) + '</script>');
				orbisTag(data);
			});
		} else if (role == 'auth') {
			global.module.filter.orbis.auth.parse(server, session, finded[0], function (auth, result) {
				if (auth == false) data = data.replace(/<body.*?<\/?body>/gim, '<body>' + result + '</body>');
				else data = data.replace(finded[0], result);
				orbisTag(data);
			});
		} else if (role == 'template') {
			global.module.filter.orbis.template.parse(server, session, finded[0], function (result) {
				data = data.replace(finded[0], result);
				orbisTag(data);
			});
		} else if (role == 'query') {
			global.module.filter.orbis.query.parse(server, session, finded[0], function (result) {
				data = data.replace(finded[0], result);
				orbisTag(data);
			});
		} else if (role == 'session') {
			global.module.filter.orbis.session.parse(server, session, finded[0], function (result) {
				data = data.replace(finded[0], result);
				orbisTag(data);
			});
		} else {
			data = data.replace(finded[0], '');
			orbisTag(data);
		}
	};

	var fs = require('fs');
	data = fs.readFileSync(server.vhost.DIR + server.path) + '';
	orbisTag(data);
}