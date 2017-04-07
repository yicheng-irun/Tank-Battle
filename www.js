var childProcess = require('child_process');
var debug = require('debug')('feiji');
var app = require('./app');
var settings = require('./settings');
var chat = require('./routes/chat.js');


//一个人边学边写这个项目写了几个月，
//无奈工作没找得好(工资低)，没时间继续写下去了
//在小公司只有加班的份
//简历上又写不出啥有亮点的东西，只能把这项目发github上赚Star，指望着哪一天星星够个几十颗了,届时把它写到简历上面能混到个大公司的面试机会
//
//你要是觉得我写的这个对你有帮助，请帮我到 https://github.com/yicheng-irun/Tank-Battle 上面点颗星
//  Thanks
// 
console.log("https://github.com/yicheng-irun/Tank-Battle");
console.log("要是你能在github上给我一颗星就好了");
console.log("%c Thanks","color:red");

console.log("www.js  pid:", process.pid);

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

console.log("server started on :" + port);