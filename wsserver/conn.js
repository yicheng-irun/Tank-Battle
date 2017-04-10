var ws = require("nodejs-websocket");
var Buffer = require('buffer').Buffer;
//var tools = require('./tools.js');

console.log("conn.js   pid:", process.pid);

var idlist = new Array(500);
for (var i = 0; i < 500; i++) {
    idlist[i] = String.fromCharCode(i);
}

function getAId() { 
    return idlist.shift();
}
function freeAId(id) {
    idlist.push(id);
}


var main = {};
(function (_this) {
    process.on("message", function (m) {
        mainMessage(m.shift(), m);
    });
    this.emit = function (title, data) {
        process.send(title + data);
    }
    this.send = function (data) { 
        process.send(data);
    }
}).bind(main)(main);

var players = {};

var waitplayer = {};

var socketfun = function (conn) {
    var host = conn.headers.host
    //console.log("conn", host);
    var thisobj = {
        id: "conn" + id + "_" + (t_count++),
        iswait:true,   //是等待中的用户
        conn: conn,
        name: null,
        active: true,
    }
    t_count > 10000000?t_count = 0:0;
    conn.on("close", function (code, reason) {
        //console.log("conn_close", host);
        thisobj.active = false;
    });
    conn.on("error", function () {

    });
    conn.on("text", function (str) {
        if (str == "2") {
            conn.send("3");
        } else {
            call(str);
        }
    });
    conn.on("binary", function (instream) {
        var data = new Buffer(0);
        instream.on("data", function (data) {
            call(data.toString());
        });
    });
    function call(data) {
        if (thisobj.iswait) {
            data = data.substring(0, 20) || "";
            noticeMain([1, thisobj.id, data]);
        } else {
            noticeMain([2, thisobj.id, data]);
        }
    }
    waitplayer[thisobj.id] = thisobj;
    conn.send(new Buffer("a"));
}
var server = ws.createServer(socketfun);

var id = null,
    t_count = 0;    //临时ID计数
var count = 0;


function userMessage(id, data){
    noticeMain([2, id, data]);
}
function noticeUser(uid, data){
    if(players[uid])
        players[uid].conn.send(new Buffer(data));
        //players[uid].conn.send(data);
}
function noticeSomeUser(idstr, data) {
    data = new Buffer(data);
    var p;
    for (var i = 0; i < idstr.length; i++) {
        p = players[idstr[i]]
        if (p)
            p.conn.send(data);
    }
}
function noticeAllUser(data) {
    data = new Buffer(data)
    for (var pi in players) {
        players[pi].conn.send(data);
        //players[pi].conn.send(data);
    }
}

function mainMessage(msg, data){
    mainEvents[msg](data);
}
function noticeMain(data) {
    main.send([id].concat(data));
}


var mainEvents = {
    2: function (data){
        noticeUser(data[0], data[1]);
    },
    3: function (data) {
        noticeSomeUser(data[0], data[1]);
    },
    4: function (data) {
        noticeAllUser(data[0]);
    },
    5: function (data) {  //new user id
        var obj = waitplayer[data[0]];
        if (obj) {
            delete waitplayer[data[0]];
            var id = data[1];
            obj.conn.send(new Buffer('b' + id));
            obj.id = id;
            obj.iswait = false;
            players[id] = obj;
        }
    },
    6: function (data){
        var fid = data[0];
        if (players[fid]) {
            setTimeout(function () {
                if (players[fid]) {
                    players[fid].conn.close();
                    delete players[fid];
                }
            }, 1500);
        }
    },
    setID: function (data) {
        id = data[0];
    },
    createServer: function (data) {
        //console.log("conn", data[0]);
        server.listen(data[0]);
    },
}


function update(){
    var ucount = 0, acount = 0;
    for (var pi in players) {
        if (players[pi].active) {
            ucount++;
        } else {
            acount++;
            noticeMain([3, pi]);
            delete players[pi];
        }
    }
    noticeMain([4, ucount]);
    //console.log("update", ucount, acount);
}


setInterval(function () {
    update();
}, 1500);