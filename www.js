var childProcess = require('child_process');
var debug = require('debug')('feiji');
var app = require('./app');
var settings = require('./settings');
var chat = require('./routes/chat.js');

console.log("www", process.pid);

var copy = require('./copy.js')

var port = 5000;
if (settings.isonline) {
    port = 18080;
}

if (!settings.isonline) {
    var wsserver = childProcess.fork('./wsserver/main.js');
}

app.set('port', process.env.PORT || port);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});

chat.init(server);

console.log("server started on " + port);