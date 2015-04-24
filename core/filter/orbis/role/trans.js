exports.parse = function (server, session, object, callback) {
    var org = object;
    var langs = server.lang.split(',');
    var data = null;
    var trans = {};
    while (true) {
        var re = /<(.*?)>(.*?)<\/\1>/gim;
        var finded = re.exec(org);

        console.log(finded);
        if (!finded) break;
        trans[finded[1]] = finded[2];
        org = org.replace(finded[0], '');
    }

    for (var i = 0; i < langs.length; i++) {
        langs[i] = langs[i].toLowerCase();
        for (var key in trans) {
            if (langs[i].indexOf(key.toLowerCase()) != -1)
                data = trans[key];
        }
        if (data) break;
    }

    if (!data) {
        for (var key in trans) {
            data = trans[key];
            break;
        }
    }

    callback(data);
}
