//var ws = require("nodejs-websocket");
var ws = require("ws").Server;
var Buffer = require('buffer').Buffer;
var childProcess = require('child_process');
var IdManage = require('./idmanage.js');

console.log("main.js   pid:", process.pid);

var fs = require('fs');
var publicfile = fs.readFileSync("wsserver/public.js").toString();
eval(publicfile.toString());

game_env = 1;

var connects = [
    { port: 8004, usernum: 0 , hasnew:false },
    { port: 8003, usernum: 0 , hasnew: false },
    //{ port: 8002, usernum: 0 , hasnew: false },
]

var referee = childProcess.fork('./wsserver/referee.js');
referee.on('message', function (data) {
    refereeMessage(data);
});


function connectMessage(data) { 
    connMessage(data.shift(),data);
}
for (var c_i in connects) {
    var conn = childProcess.fork('./wsserver/conn.js');
    conn.on('message', connectMessage);
    conn.send(["setID",c_i]);
    conn.send(["createServer",connects[c_i].port]);
    connects[c_i].conn = conn;
}

function webrequest(req,rsp) {
    rsp.writeHead(200, { 'Content-Type': 'text/plain' });
    rsp.end('Hello!\n');
}
var webserver = require('http').createServer(webrequest);

//var server = ws.createServer(function (conn) {
//    var host = conn.headers.host;
//    var origin = conn.headers.conn;
//    conn.on("close", function (code, reason) {
//    });
//    conn.on("error", function () {
//    });
//    conn.on("text", function (str) {
//        if (str == "2") {
//            conn.send("3");
//        } else {
//            call(str);
//        }
//    });
//    conn.on("binary", function (instream) {
//        var data = new Buffer(0);
//        instream.on("data", function (data) {
//            call(data.toString());
//        });
//    });
//    function call(data) {
//    }
//    function redirect(port) {
//        conn.send(new Buffer("z" + port));// JSON.stringify({ host: host.replace(/:\d*/, ""), port: port }));
//    }
//    var unum = Infinity, port = 0;
//    for (var ci in connects) {
//        if (unum > connects[ci].usernum) {
//            port = connects[ci].port;
//            unum = connects[ci].usernum;
//        }
//    }
//    redirect(port);
//})//.listen("8008")

var server = new ws({ server: webserver });
server.on("connection", function (conn) {

    conn.on('message', function (data) { 
        console.log("==", data);
    })
    function call(data) {
    }
    function redirect(port) {
        conn.send(new Buffer("z" + port));// JSON.stringify({ host: host.replace(/:\d*/, ""), port: port }));
    }
    
    var unum = Infinity, port = 0;
    for (var ci in connects) {
        if (unum > connects[ci].usernum) {
            port = connects[ci].port;
            unum = connects[ci].usernum;
        }
    }
    redirect(port);
})

webserver.listen(8008);



var ids = new IdManage(1000,"tk");
var jp_ids = new IdManage(3000,"jp");
var wt_ids = new IdManage(3000,"wt");

//通知一个用户
function noticeUser(uid, data) {
    for (var i = 0; i < connects.length; i++) {
        connects[i].conn.send([2, uid, data]);
    }
}
//通知一些用户
function noticeSomeUser(idstr, data) {
    for (var i = 0; i < connects.length; i++) {
        connects[i].conn.send([3, idstr, data]);
    }
    referee.send(data);
}
//通知所有用户
function noticeAllUser(data) {
    for (var i = 0; i < connects.length; i++) {
        connects[i].conn.send([4, data]);
    }
    referee.send(data);
}
//通知所有连接组件
function noticeAllConn(title, data){
    for (var i = 0; i < connects.length; i++) {
        connects[i].conn.send([title, data]);
    }
}
//通知连接组件
function noticeConn(cid, title, data) {
    connects[cid].conn.send([title].concat(data));
}
//通知裁判
function noticeReferee(idstr, data) {

}
//裁判的消息
function refereeMessage(data){
    //if (data instanceof Array) {
    //    refEvent[data[0]](data.splice(1));
    //}else
        refEvent[data[0]](data.substr(1));
}
//客户端的消息
function connMessage(cid, data){
    var type = data.shift();
    //console.log(data);
    if (type == 2) {    //用户的消息
        var ename = data[1][0];
        if (userEvent[ename]) {
            userEvent[ename](data[0], data[1].substr(1));
        }
    } else if (type == 1) { //用户建立连接
        if (data[0].startsWith("conn")) {
            newUser(cid[0], data);
        }
    } else if (type == 3) { //用户断开连接
        var freeid = data[0];
        var fj = tankes[freeid];
        var jpstr;
        if (fj) {
            fj.gold = fj.gold >> 1;
            if (fj.gold > 0) {
                var jp = JiangPin.setGold(jp_ids.getOne(), fj.gold, fj.x, fj.y);
                jpstr = jp.getZipStr();
                setTimeout(function () {
                    //noticeAllUser("g" + jpstr);
                    noticeSomeUser(jp.fj_tk, "g" + jpstr);
                }, 100);
            }
            Tank.remove(freeid);
            //noticeAllUser("d" + freeid);
            noticeSomeUser(fj.fj_tk + fj.id, "d" + freeid);
        }
        //if (jpstr) {
        //    setTimeout(function () {
        //        noticeAllUser("g" + jpstr);
        //    }, 100);
        //}
    } else if (type == 4) {
        connects[cid].usernum = data[0];
    }
}
//新建一个用户
function newUser(cid, data){
    if (data[1][0] == "a") {
        var nid = ids.getOne();
        //console.log("nid " , nid.length, nid.charCodeAt(0), nid.charCodeAt(1));
        noticeConn(cid, 5 , [data[0], nid]);
        var tk = Tank.add({
            id: nid,
            x : (Math.random() * (game_width << 1) - game_width)*0.95,
            y : (Math.random() * (game_height << 1) - game_height)*0.95,
            n : data[1].substr(1)||""
        });
        tk.add_fj();
        //noticeAllUser("c" + tk.getZipStr());
        noticeSomeUser(tk.fj_tk + tk.id, "c" + tk.getZipStr());
    }
}

var refEvent = {
    h: function (data) {    //击中物体
        //noticeAllUser("h" + data);
        var wid = data[1];
        var h = data.charCodeAt(2);
        var wt = wutis[wid]
        if (wt) {
            wt.h = h;
            noticeSomeUser(wt.fj_tk, "h" + data);
        }
    },
    i: function (data) {    //物体击毁
        //noticeAllUser("i" + data);
        var wid = data[1];
        var wt = wutis[wid]
        if (wt) {
            wt.h = 0;
            wt.a = false;
            noticeSomeUser(wt.fj_tk, "i" + data);
            //if (WUTIS[wt.t].t == 0) {
            var jp = JiangPin.setByWu(jp_ids.getOne(), wt);
            //} else {
            //    var jp = JiangPin.randomXY(jp_ids.getOne(), wt.x, wt.y);
            //}
            if (jp) {
                var njp = jp.getZipStr();
                //noticeAllUser("g" + njp);
                noticeSomeUser(jp.fj_tk, "g" + njp);
            }
        }
    },
    "j": function (data){   //击中坦克
        //noticeAllUser("j" + data);
        var fid = data[1];
        var h = data.charCodeAt(2);
        var fj = tankes[fid]
        if (fj) {
            fj.h = h;
            noticeSomeUser(fj.fj_tk + fj.id, "j" + data);
        }
    },
    "k": function (data){   //击毁坦克
        //noticeAllUser("k" + data);
        var fid = data[1];
        var kid = data[0];
        if (tankes[kid]) {
            tankes[kid].kill++;
        }
        var fj = tankes[fid]
        if (fj) {
            fj.h = 0;
            fj.a = false;
            noticeSomeUser(fj.fj_tk + fj.id, "k" + data);

            fj.gold = fj.gold >> 1;
            if (fj.gold > 0) {
                var jp = JiangPin.setGold(jp_ids.getOne(), fj.gold, fj.x, fj.y);
            } else {
                var jp = JiangPin.randomXY(jp_ids.getOne(), fj.x, fj.y);
            }
            var njp = jp.getZipStr();
            //noticeAllUser("g" + njp);
            noticeSomeUser(jp.fj_tk, "g" + njp);
        }
        noticeAllConn(6, fid);
    },
    
    "g": function (data){   //获取奖品信息
        var str = ""
        for (var ji in jiangpins) {
            str += jiangpins[ji].getZipStr();
        }
        referee.send("g"+str);
    },
    "s": function (data){   //坦克捡到东西了 
        var gid = data[0];
        if (jiangpins[gid]) {
            sts = jiangpins[gid].fj_tk;
            var gstr = JiangPin.getEffectStr(gid, data[1]);
            if (gstr) {
                //noticeAllUser("s" + gstr);
                noticeSomeUser(sts, "s" + gstr);
            }
        }
    },
    "w": function (data){  //获取物品信息
        var str = ""
        for (var wi in wutis) {
            str += wutis[wi].getZipStr();
        }
        referee.send("w" + str);
    },
    "x": function (data){   //排行榜信息
        var tk,rank = [],di;
        for (var i = 0; i < data.length; i++) {
            tk = tankes[data[i]]
            if (tk) {
                tk.idx = i + 1;
                noticeUser(data[i], "x" + String.fromCharCode(tk.idx));
                if (i < 10) {
                    rank.push({
                        n: tk.n,
                        k: tk.kill,
                        g: tk.gold,
                    });
                }
            }
        }
        noticeAllUser("y" + JSON.stringify(rank));
    },
    "y": function (data){   //补充奖品
        var num = data.charCodeAt(0) + 5;
        var njp = "";
        for (var i = 0; i < num; i++) {
            var jp = JiangPin.random(jp_ids.getOne());
            njp = jp.getZipStr();
            noticeSomeUser(jp.fj_tk, "g" + njp);
        }
        //noticeAllUser("g" + njp);
    },
    "z": function (data){   //补充战场物品
        var num = data.charCodeAt(0) + 5;
        var njp = "";
        for (var i = 0; i < num; i++) {
            var wt = WuTi.random();
            njp = wt.getZipStr();
            noticeSomeUser(wt.fj_tk, "w" + njp);
        }
        //noticeAllUser("w" + njp);
    }
}

//用户的消息事件
var userEvent = {
    a: function (){

    },
    b: function (uid, data){    //无

    },
    c: function (uid, data) {    //用户查询某一架飞机的简要信息 不包括名字
        var str = Tank.getZipStr(data);
        if (str) {
            noticeUser(uid, "c" + str);
        }
    },
    d: function (uid, data) {   //用户购买炮台
        var gid = data.charCodeAt(0);
        var tk = tankes[uid];
        if (tk && tk.gun != gid && GUNS[gid]) {
            tk.gun = gid;
            noticeSomeUser(tk.fj_tk + tk.id, "t" + uid + data[0] + String.fromCharCode(tk.gold));
        }
    },
    e: function (uid, data){    //表示停火
        var tk = tankes[uid];
        if (tk && tk.f) {
            tk.f = false;
            //noticeAllUser("e" + uid);
            noticeSomeUser(tk.fj_tk + tk.id, "e" + uid);
        }
    },
    f: function (uid, data){    //表示开火
        var tk = tankes[uid];
        if (tk && !tk.f) {
            // 此处应该做时间限制处理
            tk.f = true;
            //tk.f_t = 0;
            //noticeAllUser("f" + uid);
            noticeSomeUser(tk.fj_tk + tk.id, "f" + uid);
        }
    },
    g: function (uid, data){    //用户查询附近的奖品信息
        var str = ""
        var tk = tankes[uid],jp;
        if (tk) {
            if (tk.fj_jp) {
                for (var i = 0; i < tk.fj_jp.length; i++) {
                    jp = jiangpins[tk.fj_jp[i]];
                    if (jp) {
                        str += jp.getZipStr();
                    }
                }
            }
        }
        //for (var ji in jiangpins) {
        //    str += jiangpins[ji].getZipStr();
        //}
        noticeUser(uid, "g" + str);
    },
    n: function (uid, data){    //查询用户的名字信息
        if (data) {
            var fj = tankes[data];
            if (fj) {
                noticeUser(uid,"n" + fj.id + fj.n);
            }
        }
    },
    p: function (uid, data){    //用户发送的炮塔变换方向事件
        var tk = tankes[uid];
        if (tk) {
            tk.p = data.charCodeAt(0);
            //noticeAllUser("p" + uid + data[0]);
            noticeSomeUser(tk.fj_tk + tk.id, "p" + uid + data[0]);
        }
    },
    r: function (uid, data) {    //用户发送的移动方向事件
        var mtstr = Tank.getMoveStr(uid, data.charCodeAt(0));
        if (mtstr) {
            var tk = tankes[uid];
            //noticeAllUser("m" + mtstr);
            noticeSomeUser(tk.fj_tk + tk.id, "m" + mtstr);
        }
    },
    w: function (uid, data) {    //用户查询附近的物品信息
        var str = ""
        var tk = tankes[uid], wt;
        if (tk) {
            if (tk.fj_wt) {
                for (var i = 0; i < tk.fj_wt.length; i++) {
                    wt = wutis[tk.fj_wt[i]];
                    if (wt) {
                        str += wt.getZipStr();
                    }
                }
            }
        }
        //for (var wi in wutis) {
        //    str += wutis[wi].getZipStr();
        //}
        noticeUser(uid, "w" + str);
    },

    "C": function (uid, data){  //获取附近物品id
        var tk = tankes[uid];
        if (tk) {
            var str = tk.fj_wt;
            str = String.fromCharCode(str.length) + str;
            str += tk.fj_jp;
            if (str && str.length > 1) {
                noticeUser(uid, "C" + str);
            }
        }
    },
    "D": function (uid, data){  //获取附近物品信息
        var len = data.charCodeAt(0);
        var wts = data.substr(1, len);
        var jps = data.substr(len + 1);
        var str = ""
        for (var i = 0; i < wts.length; i++) {
            wt = wutis[wts[i]];
            if (wt) {
                str += wt.getZipStr();
            }
        }
        str = String.fromCharCode(str.length) + str;
        for (var i = 0; i < jps.length; i++) {
            jp = jiangpins[jps[i]];
            if (jp) {
                str += jp.getZipStr();
            }
        }
        if (str.length > 1) {
            noticeUser(uid, "D" + str);
        }
    }
};


function send_move_to(now_time){
    var mtstr, tk;
    for (var ti in tankes) {
        var tk = tankes[ti];
        if (tk.v > dft_speed && tk.v_t < now_time) {
            tk.v = dft_speed;
            mtstr = tk.getMoveStr();
            if (mtstr) {
                //noticeAllUser("m" + mtstr);
                noticeSomeUser(tk.fj_tk + tk.id, "m" + mtstr);
            }
            continue;
        }
        if (tk.mt_t < now_time) {
            mtstr = tk.getMoveStr();
            if (mtstr) {
                //noticeAllUser("m" + mtstr);
                noticeSomeUser(tk.fj_tk + tk.id, "m" + mtstr);
            }
        }
    }
}


function update(){
    var now_time = new Date().getTime();
    main_tick(now_time);
    send_move_to(now_time);
}
setInterval(update, 16);

function update_fj(){
    Tank.tick_fj();
}
setInterval(update_fj, 1000);
