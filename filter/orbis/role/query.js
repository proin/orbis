exports.parse = function (server, session, object, callback) {
    var re = /<orbis.*?type="(.*?)".*?<\/?orbis>/gim;
    var type = re.exec(object);
    if (type == null) {
        callback('');
        return;
    }
    type = type[1];

    re = /<orbis.*?key="(.*?)".*?<\/?orbis>/gim;
    var key = re.exec(object);
    key = key == null ? null : key[1];

    re = /<orbis.*?name="(.*?)".*?<\/?orbis>/gim;
    var valueName = re.exec(object);
    valueName = valueName == null ? 'query' : valueName[1];

    var data = server.query;
    if (key != null) data = data[key];
    if (data == null) data = '';
    if (type == 'javascript') {
        callback('<script type="text/javascript">var ' + valueName + '=' + JSON.stringify(data) + '</script>');
    } else if (type == 'html') {
        if (typeof data == 'string') callback(data);
        else callback(JSON.stringify(data));
    } else {
        callback('');
    }
}