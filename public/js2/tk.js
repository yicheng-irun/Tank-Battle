(function () {


    var tools = {};
    tools.number2Chars = function (num, byte, hasminus) {     //数字转二进制字符串
        var count = byte == undefined ? 4 : byte;
        if (hasminus) {
            num += 1 << ((count << 3) - 1);
        }
        var result = "";
        for (var i = 0 ; i < count; i++) {
            result = String.fromCharCode(num & 255) + result;
            num = num >> 8;
        }
        return result;
    }
    tools.chars2Number = function (chars, hasminus) {
        var num = 0;
        for (var ci in chars) {
            num = (num << 8) + chars.charCodeAt(ci);
        }
        if (hasminus) {
            num -= 1 << ((chars.length << 3) - 1);
        }
        return num;
    }
    tools.deg2Zip = function (deg) {    //角度转压缩后的角度
        return Math.floor((deg << 1) / 3);
    }
    tools.zip2Deg = function (zipDeg) { //压缩后的角度转正常角度
        return zipDeg * 3 >> 1;
    }
    tools.deg2vector = function () {
        var degreeToRadiansFactor = Math.PI / 180;
        return function (deg) {
            var result = { x: 0, y: 0 };
            var rad = (deg % 360) * degreeToRadiansFactor;
            result.y = Math.sin(rad);
            result.x = Math.cos(rad);
            return result;
        }
    }();
    tools.vector2deg = function () {
        var radianToDegreesFactor = 180 / Math.PI;
        return function (x, y) {
            if (x == 0 && y == 0) {
                return 360;
            }
            rad = Math.atan(y / x);
            var result = rad * radianToDegreesFactor;
            if (x < 0) {
                result += 180;
            }
            if (result < 0) {
                result += 360;
            }
            return result;
        }
    }();
    tools.w2level = function (w) {  //w经验转等级
        w = w << 1;
        var m = Math.floor(Math.sqrt(w));
        if (w < m * m + m) {
            return m - 1;
        }
        return m;
    }
    tools.level2w = function (level) {
        return Math.round((level * level) + level / 2);
    }
    tools.w2health = function (w) {  //w经验转生命值
        return tools.level2health(tools.w2level(w));
    }
    tools.level2health = function (lv) {  //w经验转生命值
        return 10 + (lv << 1);
    }



    var pageData = {
        suportWS: "WebSocket" in window,
        rank: 0,
        playing: false,
        userName: "",
        userNum: 0,
        rotation: 0,

        game: {
            lvstr: "",  //lv:0
            lvperbar: 0,   //per
            healthstr: "", //10/10
            healthperbar: 0,   //per
            rlist: [
                { name: "asdf", rank: 14000 },
                { name: "asdf", rank: 14000 },
                { name: "asdfasdf", rank: 14000 },
                { name: "sss", rank: 14000 },
                { name: "assdfsfdf", rank: 14000 },
                { name: "", rank: 14000 },
                { name: "", rank: 14000 },
                { name: "asdf", rank: 14000 },
                { name: "asd", rank: 14000 },
                { name: "asdf", rank: 14000 },
            ],
        }
    };

    var Blob = window.Blob || window.webkitBlob;
    function str2blob(str) {
        var b = new Blob([str], { "type": "text/plan" });
        return b;
    }
    function str2ab(str) {
        var buf = new ArrayBuffer(str.length); // 2 bytes for each char
        var bufView = new Uint8Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }
    function getData(data, callback) {
        if ("string" == typeof data) {
            if (callback instanceof Function) {
                callback(data);
            }
        } else if (data instanceof ArrayBuffer) {
            var b = new Blob([data]);
            var f = new FileReader();
            f.onload = function () {
                if (callback instanceof Function) {
                    callback(this.result);
                }
            }
            f.readAsText(b);
        } else if (data instanceof Blob) {
            var f = new FileReader();
            f.onload = function () {
                if (callback instanceof Function) {
                    callback(this.result);
                }
            }
            f.readAsText(data);
        }
    }
    if (location.hostname == "tank.xiwnn.com") {
        var wsuri = "ws://t.xiwnn.com:8009/";
    } else {
        var wsuri = "ws://" + location.hostname + ":8009/";
    }
    //


    var socket = {};
    (function (socket) {
        var _this = this;
        var eventslist = {};
        var ws = {};
        var isonline = false;

        this.emit = function (title, data) {
            if (ws.readyState == 1)
                ws.send(str2blob(title + data));
        }
        this.emitStr = function (title, data) {
            if (ws.readyState == 1)
                ws.send(title + data);
        }
        function call(data) {
            var fcode = data[0];
            if (tanggame.events[fcode]) {
                tanggame.events[fcode](data.substring(1));
            }
        }

        function connect(name) {
            if (isonline) {
                socket.emit("a", name);
                return;
            }
            isonline = true;
            _this.ws = ws = new WebSocket(wsuri);
            //window.ws = ws;
            //ws.binaryType = "arraybuffer";
            ws.binaryType = "blob";

            ws.onmessage = function (event) {
                getData(event.data, call);
            }
            ws.onopen = function (event) {
                console.log("open");
                socket.emit("a", name);
            }
            ws.onerror = function (event) {
                console.log("error")
            }
            ws.onclose = function (event) {
                console.log("close");
                isonline = false;
                tanggame.gameover();
            }
            //ws.send(str2ab("hhhhhhhhhhhhhhhhhhhhhhhhhhhh"));
        }

        this.play = function (name) {
            connect(name);
        }

        setInterval(function () {
            if (isonline && ws.send) {
                ws.send("2");
            }
        }, 10000);

    }).bind(socket)(socket);


    function Goods(data, manage) {
        this.manage = manage;
        this.type = 0;  //类型
        this.x = 0;     //x坐标
        this.y = 0;     //y坐标
        this.h = 0;     //生命值
        this.b = 10;    //半径

        this.model = new createjs.Shape();


    }
    Goods.prototype.update = function () {

    }
    Goods.prototype.updateH = function () {

    }


    /*
        坦克
    */
    function Tang(data, manage) {
        this.manage = manage;
        this.x = 0;     //坦克的x坐标
        this.y = 0;     //坦克的y坐标
        this.r = 270;     //坦克方向
        this.n = "";     //名字
        this.u = 0;     //用户标定字符串
        this.w = 0;     //经验
        this.level = 1; //等级
        this.h = 10;     //生命值
        this.b = 18;    //半径
        this.mtime = new Date().getTime();
        this.m = 360;   //移动方向

        this.f = false; //信息是否全面的标识

        for (var i in data) {
            if (this[i] !== undefined) {
                this[i] = data[i];
            }
        }

        this.model = new createjs.Container();
        this.head = new createjs.Shape();   //头部，包含炮管
        this.body = new createjs.Shape();   //身体，包含底盘
        this.health = new createjs.Shape();   //健康条
        this.mrank = new createjs.Shape();  //军衔

        var g = this.head.graphics;
        g.f("#ccc").dr(8, -5, 10, 10);
        g.f("#fff").rc(-10, -10, 20, 20, 4, 7, 7, 4);
        g.f("#fff").rc(-8, -8, 15, 16, 2, 5, 5, 2);
        this.head.scaleX = this.head.scaleY = 1;
        //this.head.shadow = new createjs.Shadow("#333", 1, 1, 8);

        g = this.body.graphics;
        g.f("#ccc")
            .rc(-15, -16, 34, 8, 1, 1, 1, 1)
            .rc(-15, 8, 34, 8, 1, 1, 1, 1);
        g.f("#eee")
            .rc(-13, -16, 32, 8, 1, 1, 1, 1)
            .rc(-13, 8, 32, 8, 1, 1, 1, 1);
        g.f("#ddd").rc(-12, -15, 24, 30, 3, 3, 3, 3);
        this.body.scaleX = this.body.scaleY = 1
        //this.body.shadow = new createjs.Shadow("#333", 0, 0, 8);

        this.health.shadow = new createjs.Shadow("#333", 0, 0, 3);
        this.health.y = 30;

        this.mrank.shadow = new createjs.Shadow("#830", 0, 0, 3);
        this.mrank.x = 24;
        this.mrank.y = 20;

        var namestr = this.n;
        this.nameText = new createjs.Text(namestr, "12px Arial 'MicroSoft YaHei', kaiti", "#aaa");
        this.nameText.textAlign = "center"
        //this.nameText.maxWidth = 60;
        this.nameText.scaleX = this.nameText.scaleY = 1;
        this.nameText.y = 34;
        //this.nameText.shadow = new createjs.Shadow("#000", 1, 1, 2)

        this.model.addChild(this.body);
        this.model.addChild(this.head);
        this.model.addChild(this.health);
        this.model.addChild(this.mrank);
        this.model.addChild(this.nameText);
        this.update();
        this.updateH();
        this.updateW();
    }
    Tang.prototype.tscale = 100 / 1000;
    Tang.prototype.mtime = 100000;
    Tang.prototype.move = function (data) {
        this.model.x = this.x = data.x;
        this.model.y = this.y = data.y;
        if (data.r != undefined)
            this.r = data.r;
        this.m = data.m;
        this.mtime = new Date().getTime();
        //if (this.m < 360) {
        //    this.updateM();
        //}


        ////========================
        //return;
        //this.x = data.x;
        //this.y = data.y;
        //if(data.r!=undefined)
        //    this.r = data.r;
        //this.m = data.m;

        createjs.Tween.removeTweens(this.model);
        if (this.m < 360) {
            this.updateM();
            var v = tools.deg2vector(this.m);
            var sdis = this.mtime * this.tscale;
            v.x = v.x * sdis + this.x;
            v.y = v.y * sdis + this.y;
            createjs.Tween.get(this.model).to({ x: this.x, y: this.y }, 20).to({ x: v.x, y: v.y }, this.mtime);
        } else {
            createjs.Tween.get(this.model).to({ x: this.x, y: this.y }, 20);
        }
    }
    Tang.prototype.updateM = function () {
        if (this.m == 360) {

        } else {
            createjs.Tween.removeTweens(this.body);
            var subr = this.body.rotation - this.m;
            if (subr > 180) {
                this.body.rotation -= 360;
            } else if (subr < -180) {
                this.body.rotation += 360;
            }
            createjs.Tween.get(this.body).to({ rotation: this.m }, 200);
        }
    }
    Tang.prototype.updateR = function (animate) {
        if (animate) {
            createjs.Tween.get(this.head).to({ rotation: this.r }, 20);
        } else
            this.head.rotation = this.r;
    }
    Tang.prototype.updateN = function () {
        this.nameText.text = this.n;
    }
    Tang.prototype.updateW = function () {
        var lv = this.level = tools.w2level(this.w);
        lv = this.w;
        //lv = 65535
        var g = this.mrank.graphics;
        g.clear();
        var dlist = [];
        while (lv > 0) {
            dlist.push(lv & 3);
            lv = lv >> 2;
        }
        var by = 0;
        g.s("rgba(255,150,0,0.7)");
        for (var i = 0; i < dlist.length; i++) {
            if (i == 0) {           //1
                for (var j = 0; j < dlist[i]; j++) {
                    //g.dc(4, by, 2);
                    g.dp(4, by, 2, 2, 0, 45);
                    by -= 5;
                }

            } else if (i == 1) {    //4
                if (dlist[i] != 0)
                    by -= 2;

                for (var j = 0; j < dlist[i]; j++) {
                    g.mt(1, by + 1).lt(4, by - 2).lt(7, by + 1).lt(4, by - 1).lt(1, by + 1);
                    //g.dp(4, by, 3, 3, 0.9, 30);
                    by -= 4;
                }

            } else if (i == 2) {    //16
                if (dlist[i] != 0)
                    by -= 4;
                for (var j = 0; j < dlist[i]; j++) {
                    //g.dp(4,by,3,4,0.8,45);
                    g.dp(4, by, 3, 5, 0.8, -17);
                    by -= 6;
                }

            } else if (i == 3) {    //64
                if (dlist[i] != 0)
                    by -= 4;
                for (var j = 0; j < dlist[i]; j++) {
                    g.dp(4, by, 3, 5, 0.8, -17);
                    g.mt(-1, by).lt(-2, by).mt(9, by).lt(10, by);
                    by -= 7;
                }

            } else if (i == 4) {    //256
                if (dlist[i] != 0)
                    by -= 4;
                for (var j = 0; j < dlist[i]; j++) {
                    g.dp(4, by, 4, 6, 0.8, 30);
                    g.mt(0, by).lt(-2, by).mt(8, by).lt(10, by);
                    by -= 8;
                }

            } else if (i == 5) {    //1024
                if (dlist[i] != 0)
                    by -= 4;
                for (var j = 0; j < dlist[i]; j++) {
                    g.dp(4, by, 4, 10, 0.8, 0);
                    g.mt(0, by).lt(-3, by).mt(8, by).lt(11, by);
                    by -= 10;
                }
            } else if (i == 6) {    //4096
                if (dlist[i] != 0)
                    by -= 4;
                for (var j = 0; j < dlist[i]; j++) {
                    g.dp(4, by, 4, 10, 0.8, 0);
                    g.mt(0, by).lt(-3, by).mt(8, by).lt(11, by)
                    .mt(0, by - 2).lt(-5, by - 2).mt(8, by - 2).lt(13, by - 2);
                    by -= 10;
                }
            } else {    //4096
                if (dlist[i] != 0)
                    by -= 4;
                for (var j = 0; j < dlist[i]; j++) {
                    g.dp(4, by, 4, 9, 0.8, 0);
                    g.mt(0, by).lt(-3, by).mt(8, by).lt(11, by)
                    .mt(-2, by - 2).lt(-5, by - 2).mt(10, by - 2).lt(13, by - 2)
                    .mt(-2, by + 2).lt(-5, by + 2).mt(10, by + 2).lt(13, by + 2)
                    .mt(-5, by).lt(-10, by).mt(13, by).lt(18, by)
                    by -= 10;
                }
                if (dlist[i] != 0)
                    by -= 2;

            }
        }

        if (this.manage.myTang == this) {
            pageData.game.lvstr = "lv:" + this.w;
            //var minw = tools.level2w(this.level);
            //var maxw = tools.level2w(this.level + 1);
            //this.level + 1;
            //pageData.game.lvperbar = (this.w - minw) / (this.level + 1);    //yicheng
            pageData.game.lvperbar = 100;
        }
    }
    Tang.prototype.updateH = function () {
        var g = this.health.graphics;
        g.clear();
        var mh = tools.w2health(this.w);
        var len = this.h * 40 / mh;
        len < 0 ? len = 0 : 0;

        var bcolor = "rgba(200,0,0,0.5)";
        var mcolor = "#d00";

        if (this == this.manage.myTang) {
            bcolor = "rgba(0,200,0,0.5)";
            mcolor = "#0d0";
        }

        g.f(bcolor).dr(-20, -1, 40, 2);
        g.f(mcolor).dr(-20, -1, len, 2);

        if (this.manage.myTang == this) {
            pageData.game.healthstr = this.h + "/" + mh;
            pageData.game.healthperbar = len * 2.5;
        }
    }
    Tang.prototype.update = function () {
        this.model.x = this.x;
        this.model.y = this.y;
        this.head.rotation = this.r;
    }
    //判断是否正在运行着动画
    Tang.prototype.addW = function (num) {
        this.w += num;
        var lv = tools.w2health(this.w);
        var ylv = tools.level2health(this.level);
        if (lv - ylv > 0) {
            this.h += lv - ylv;
            this.updateH();
        }
        this.updateW();
    }
    Tang.prototype.subH = function (num) {
        this.h -= num;
        this.updateH();
    }
    Tang.prototype.hasActiveTweens = function () {
        return (createjs.Tween.hasActiveTweens(this.model) || createjs.Tween.hasActiveTweens(this.head));
    }
    //玩完
    Tang.prototype.gameover = function () {
        createjs.Tween.removeTweens(this.model);
        createjs.Tween.get(this.model).to({ alpha: 0.1, scaleX: 1.5, scaleY: 1.5 }, 500).wait(200).call(this.dispose, null, this);
    }
    //销毁
    Tang.prototype.dispose = function () {
        this.model.removeAllChildren()
        if (this.model.parent) {
            this.model.parent.removeChild(this.model);
        }
        if (this.manage) {
            delete this.manage.tangs[this.u];
        }
    }
    Tang.prototype.fire = function (sid, manage) {
        return new Shell({
            sid: sid,
            manage: this.manage,
            x: this.model.x,
            y: this.model.y,
            r: this.r,
            w: this.w,
            b: this.b,
            m: this.m,
        });
    }
    Tang.prototype.calculateLoc = function () {
        if (this.m < 360) {
            var ntime = new Date().getTime();
            var sm = (ntime - this.mtime) * this.tscale;
            var v = tools.deg2vector(this.m);
            this.x += v.x * sm;
            this.y += v.y * sm;
            this.mtime = ntime;
        } else {
            this.mtime = new Date().getTime();
        }
    }

    function Shell(data) {
        this.sid = "";
        this.manage = null;
        this.x = 0;
        this.y = 0;
        this.r = 0;
        this.m = 0;     //表示当前主体的移动方向
        this.j = 500;   //距离
        this.d = 4;     //重量
        this.w = 10;    //发射者的质量
        this.b = 10;
        this.k = "";

        for (var i in data) {
            if (this[i] !== undefined) {
                this[i] = data[i];
            }
        }

        this.model = new createjs.Shape();
        var g = this.model.graphics;
        g.f("#fff").dc(0, 0, 4);
        //this.model.scaleX = this.model.scaleY = this.b / 10;
        //this.model.shadow = new createjs.Shadow("#000000", 1, 1, 5);

        this.update();
    }
    Shell.prototype.go = function () {
        var _this = this;
        var mubiao = tools.deg2vector(this.r);
        this.model.x = this.x = this.x + mubiao.x * this.b;
        this.model.y = this.y = this.y + mubiao.y * this.b;

        mubiao.x *= this.j;
        mubiao.y *= this.j;
        createjs.Tween.get(this.model).to({ x: mubiao.x + this.x, y: mubiao.y + this.y }, 2500).call(function () {
            _this.dispose();
        });
    }
    Shell.prototype.update = function () {
        this.model.x = this.x;
        this.model.y = this.y;
    }
    //销毁
    Shell.prototype.dispose = function () {
        if (this.manage) {
            delete this.manage.shells[this.sid];
        }
        createjs.Tween.removeTweens(this.model);
        createjs.Tween.get(this.model).to({
            scaleX: 3,
            scaleY: 3,
            alpha: 0
        }, 200).call(Shell.prototype.removeFromView, null, this);
    }
    Shell.prototype.removeFromView = function () {
        if (this.model.parent) {
            this.model.parent.removeChild(this.model);
        }
    }

    function Manage(data) {
        this.tangs = {};
        this.shells = {};
        this.goods = {};
        this.map = new createjs.Shape();    //地图
        this.userID = "";
        this.myTang = null;
        this.fireState = false;
        this.lastfiretime = 0;

        this.gamewidth = 2000;
        this.gameheight = 2000;

        for (var i in data) {
            if (this[i] !== undefined) {
                this[i] = data[i];
            }
        }

        this.hasTimerR = false;

        this.tick_count = 0;

        this.w = 1366;
        this.h = 1366;

        this.tangContainer = new createjs.Container();
        this.shellContainer = new createjs.Container();
        this.goodsContainer = new createjs.Container();
    }
    Manage.prototype.addTang = function (data) {    //添加一个糖
        var tang = new Tang(data, this);
        this.tangs[data.u] = tang;
        this.tangContainer.addChild(tang.model);
        if (data.u == this.userID) {
            this.myTang = tang;
        }
        return tang;
    }
    Manage.prototype.removeTang = function (id) { //移除一个糖
        if (this.tangs[id]) {
            this.tangs[id].dispose();
            delete this.tangs[id];
        }
    }
    Manage.prototype.moveTang = function (data) {   //移动一个糖
        for (var i = 0; i < data.length; i += 10) {
            var td = {};
            td.u = data.substr(i, 2);
            td.x = tools.chars2Number(data.substr(i+2, 3), true);
            td.y = tools.chars2Number(data.substr(i+5, 3), true);
            if (this.userID != td.u) {
                td.r = tools.zip2Deg(tools.chars2Number(data.substr(i+8, 1)));
            }
            td.m = tools.zip2Deg(tools.chars2Number(data.substr(i+9, 1)));

            var tang = this.tangs[td.u];
            if (tang) {
                tang.move(td);
            }
        }
    }
    Manage.prototype.rotate = function (id, r) {    //旋转炮塔
        var tang = this.tangs[id];
        if (tang) {
            tang.r = r;
            tang.updateR(true);
        }
    }
    Manage.prototype.setMyR = function (dr) {
        this.myTang.r = dr;
        this.myTang.updateR();
        if (!this.hasTimerR) {
            var _this = this;
            setTimeout(function () {
                socket.emit("i", tools.number2Chars(tools.deg2Zip(Math.floor(_this.myTang.r)), 1));
            }, 40);
        }
    }
    Manage.prototype.fireMore = function (data) {   //接受一串开火状态
        var id, sid, r;
        for (var i = 0; i < data.length; i += 5) {
            id = data.substr(i, 2);
            sid = data.substr(i + 2, 2);
            r = data.substr(i + 4, 1);
            this.rotate(id, tools.zip2Deg(tools.chars2Number(r)));
            this.fire(id, sid);
        }
    }
    Manage.prototype.prefire = function () {    //重新开火
        if (this.fireState) {
            var ntime = new Date().getTime();
            var stime = ntime - this.lastfiretime;
            if (stime > 480 && this.myTang) {
                this.lastfiretime = ntime;
                socket.emit("h", tools.number2Chars(tools.deg2Zip(Math.floor(this.myTang.r)), 1));
            }
        }
    }
    Manage.prototype.fire = function (id, sid) {   //开火
        var _this = this;
        var tang = this.tangs[id];
        if (tang) {

            if (Math.abs(tang.model.x - this.myTang.model.x) > 1800 || Math.abs(tang.model.y - this.myTang.model.y) > 1800) {
                return;
            }
            var shell = tang.fire(sid);
            this.shellContainer.addChild(shell.model);
            shell.go();
            this.shells[sid] = shell;
        }
    }
    Manage.prototype.hit = function (data) {    //击中
        var tid = data.substr(0, 2);
        var sid = data.substr(2, 2);
        var mid = data.substr(4, 2);
        var num = data.substr(6, 1);
        var addw = data.substr(7, 1);  //杀死了

        var t2 = this.tangs[mid];
        if (num != "" && t2)
            t2.subH(num.charCodeAt(0));

        if (addw != "") {
            if (this.userID == mid) {   //自己挂了
                //tanggame.gameover();
                //this.myTang = null;
            }
            var t1 = this.tangs[tid];
            if (t1)
                t1.addW(addw.charCodeAt(0));
            if (t2)
                t2.gameover();
        }
        var shell = this.shells[sid];
        if (shell)
            shell.dispose();
    }
    Manage.prototype.subHealth = function (data, isdied) {
        var tang = this.tangs[data];
        if (tang) {
            tang.h--;
            tang.updateH();
            if (isdied) {
                tang.gameover();
                if (data == this.userID) {
                    //tanggame.gameover();
                    //this.myTang = null;
                }
            }
        }
    }
    Manage.prototype.clear = function () {
        this.tangs = {};
        this.shells = {};
        this.tangContainer.removeAllChildren();
        this.shellContainer.removeAllChildren();
    }
    Manage.prototype.readNearbyTangs = function (data) {
        for (var i = 0; i < data.length; i += 10) {
            var td = {};
            td.u = data.substr(i, 2);
            td.x = tools.chars2Number(data.substr(i + 2, 3), true);
            td.y = tools.chars2Number(data.substr(i + 5, 3), true);
            td.r = tools.zip2Deg(tools.chars2Number(data.substr(i + 8, 1)));
            td.m = tools.zip2Deg(tools.chars2Number(data.substr(i + 9, 1)));
            if (this.tangs[td.u]) {
                var tang = this.tangs[td.u];
                tang.x = td.x;
                tang.y = td.y;
                tang.r = td.r;
                tang.m = td.m;
            } else {
                this.addTang(td);
                socket.emit("c", td.u);
            }
        }
        //this.updateTangInfo();
    }
    Manage.prototype.updateTangInfo = function (data) {
        if (data == undefined) {
            for (var ti in this.tangs) {
                if (!this.tangs[ti].f) {
                    socket.emit("c", ti);
                }
            }
        } else {
            var uid = data.substr(0, 2);
            var w = tools.chars2Number(data.substr(2, 3));
            var h = tools.chars2Number(data.substr(5, 2));
            var name = data.substr(7);
            var tang = this.tangs[uid];
            if (tang) {
                tang.w = w;
                tang.h = h;
                tang.n = name;
                tang.updateN();
                tang.updateH();
                tang.updateW();
                tang.f = true;
            }
        }
    }

    Manage.prototype.isInView = function (tang) {

        return true;
    }

    Manage.prototype.updateRank = function () {
        if (!this.myTang)
            return;

        var list = [];
        for (var ti in this.tangs) {
            list.push({
                name: this.tangs[ti].n,
                rank: this.tangs[ti].w
            });
        }
        list.sort(function (a, b) {
            if (a.rank - b.rank != 0) {
                return b.rank - a.rank;
            }
            return b.name > a.name ? 1 : -1;
        });
        pageData.game.rlist = list.slice(0, 10);
    }
    Manage.prototype.updateMap = function (data) {

        var g = this.map.graphics;
        g.clear();

        var bx = this.w - 200;
        var by = this.h - 210;
        g.f("rgba(0,0,0,0.3)");
        g.dr(bx, by, 180, 180);
        g.s("rgba(255,255,255,0.5)").ss(1).f();

        var scx = 90 / this.gamewidth;
        var scy = 90 / this.gameheight;

        var cx = this.goodsContainer.parent.x;
        var cy = this.goodsContainer.parent.y;

        var tx = this.gamewidth - cx;
        var ty = this.gameheight - cy;
        g.dr(bx + tx * scx, by + ty * scy, this.w * scx, this.h * scy);
        //}

        if (this.myTang) {
            //g.s("rgba(255,255,255,0.3)").f("rgba(255,0,0,0.3)");
            for (var ti in this.tangs) {
                if (ti != this.userID) {
                    g.s("rgba(255,255,255,0.3)").f("rgba(255,0,0,0.3)");
                    g.dc(bx + (this.tangs[ti].x + this.gamewidth) * scx, by + (this.tangs[ti].y + this.gameheight) * scy, 2);
                }
            }
            g.s("rgba(255,255,255,0.5)").f("rgba(0,255,0,0.5)");
            var mx = bx + (this.myTang.model.x + this.gamewidth) * scx;
            var my = by + (this.myTang.model.y + this.gameheight) * scy;
            g.dc(mx, my, 2);
        }
        //g.dc(200,200,10).dc(500,500,10)
        //g.f().dr();
    },
    Manage.prototype.tick = function (data) {
        this.updateMap();

        this.tick_count++;
        if (this.tick_count % 60 == 0) {
            this.updateRank();
        }

        //if (this.tick_count % 40 == 0) {
        //    var tang;
        //    for (var ti in this.tangs) {
        //        tang = this.tangs[ti];
        //        tang.calculateLoc();

        //    }
        //}




        this.tick_count %= 600;




    }




    var tanggame = {};
    (function (_this) {
        var canvas = document.getElementById("js-game");
        var $body = $("body");

        var w = 1366, h = 768;  //实时更新的屏幕宽高
        var pagew = w, pageh = h;

        var gamewidth = 3000, gameheight = 3000;
        var viewcenter = { x: 0, y: 0 };   //视角中心
        var viewoffset = { x: -0, y: -0 };

        var stage;

        var mainContainer;      //主容器
        var bgContainer;        //背景容器

        var bglines;    //背景线

        var presskeys = {};     //按下的键

        var manage;

        this.events = {
            a: function (data) {    //设置用户id
                manage.clear();
                manage.userID = data;

                createjs.Ticker.setFPS(60);

                $("#js-start-page").removeClass("show");
                setTimeout(function () {
                    $("#js-start-page").hide();
                }, 300);
            },
            b: function (data) {        //返回用户的范围内坦克数据
                manage.readNearbyTangs(data);
                pageData.playing = true;
            },
            c: function (data) {    //更新指定的某一个糖的信息
                manage.updateTangInfo(data);
            },
            d: function (data) {    //收到完整的信息，在b的基础上包括了w 暂用于裁判服务器

            },
            e: function (data) {    //服务器发送的移动指令
                manage.moveTang(data);
            },
            f: function (data) {    //服务器发送的开火指令

                manage.fireMore(data);

                //var id = data.substr(0, 2);
                //var sid = data.substr(2, 2);
                //var r = data.substr(4, 1);
                //if (r != "") {
                //    manage.rotate(id, tools.zip2Deg(tools.chars2Number(r)));
                //}
                //manage.fire(id, sid);
            },
            g: function (data) {    //击中信息
                manage.hit(data);
            },
            h: function (data) {    //用户关闭了链接，直接移除
                manage.removeTang(data);
            },
            i: function (data) {    //越界掉血
                manage.subHealth(data);
            },
            j: function (data) {    //越界掉血死亡
                manage.subHealth(data, true);
            },

        }

        function testinit() {

            //manage.myTang = manage.addTang({
            //    x: 0,
            //    y: 0,
            //    m: 0,
            //    n: "tests他"
            //});

            //setTimeout(function () {
            //    manage.addTang({
            //        u: "2345",
            //        x: 0,
            //        y: 0,
            //        m: 0,
            //        r: 0,
            //        n: "tests他"
            //    });
            //},1500);

            //manage.fire("asdf");

            //setInterval(function () {
            //    manage.fire("asdf");
            //}, 800);

        }


        this.play = function (name) {
            manage.clear();
            socket.play(name);
        }
        this.gameover = function () {
            console.log("gameover__")
            pageData.playing = false;
            $("#js-start-page").show()
            setTimeout(function () {
                $("#js-start-page").addClass("show")
                createjs.Ticker.setFPS(10);
            }, 300);
            //setTimeout(function () {
            //}, 300);
        }

        var updateKeyState = function () {
            var up, down, left, right, x, y, rotate = 0, fire = false;
            var emittimeout;
            var stateobj = {
                r: 0,
                x: 0,
                y: 0,
            };
            return function (type) {
                if (!pageData.playing || manage.myTang == null) {
                    return;
                }
                if (type == 1) {
                    up = presskeys[87] || presskeys[38];
                    down = presskeys[83] || presskeys[40];
                    left = presskeys[65] || presskeys[37];
                    right = presskeys[68] || presskeys[39];

                    y = up && !down ? -1 : (!up && down ? 1 : 0);
                    x = left && !right ? -1 : (!left && right ? 1 : 0);
                    var newr = 360;
                    if (x > 0) {
                        if (y > 0) {
                            newr = 45;
                        } else if (y < 0) {
                            newr = 315;
                        } else {
                            newr = 0;
                        }
                    } else if (x < 0) {
                        if (y > 0) {
                            newr = 135;
                        } else if (y < 0) {
                            newr = 225;
                        } else {
                            newr = 180;
                        }
                    } else {
                        if (y > 0) {
                            newr = 90;
                        } else if (y < 0) {
                            newr = 270;
                        } else {
                            newr = 360;
                        }
                    }
                    if (newr != rotate) {
                        rotate = newr;
                        clearTimeout(emittimeout)
                        emittimeout = setTimeout(function () {
                            socket.emit('f', tools.number2Chars(tools.deg2Zip(rotate), 1));
                        }, 15);

                    }
                } else if (type == 2) {     //开火
                    var f = presskeys[32] || presskeys["f"];
                    if (f != fire) {
                        manage.fireState = fire = f;
                        if (fire) {
                            //manage.prefire();
                            socket.emit("h", tools.number2Chars(tools.deg2Zip(Math.floor(manage.myTang.r)), 1));
                        } else {
                            socket.emit("g", tools.number2Chars(tools.deg2Zip(Math.floor(manage.myTang.r)), 1));
                        }
                    }
                }
            }
        }();

        //var bg_update_count = -1;
        function updateBackground() {       //绘制背景网格
            //bg_update_count++;
            //if (bg_update_count % 6 != 0) {
            //    return;
            //}
            //bg_update_count %= 6;

            if (bglines == null) {
                bglines = new createjs.Shape();
                bgContainer.addChild(bglines);
            }

            var g = bglines.graphics;
            g.clear();

            var dx1 = cx = viewcenter.x + viewoffset.x - w / 2;
            var dy1 = cy = viewcenter.y + viewoffset.y - h / 2;
            var dx2 = bx = cx + w;
            var dy2 = by = cy + h;

            cx < -gamewidth ? cx = -gamewidth : 0;
            cy < -gameheight ? cy = -gameheight : 0;

            bx > gamewidth ? bx = gamewidth : 0;
            by > gameheight ? by = gameheight : 0;

            //var yux = cx % 50
            //var yuy = cy % 50;
            //cx -= yux;
            //cy -= yuy;

            dx1 -= (dx1 % 50) + 50;
            dy1 -= (dy1 % 50) + 50;

            var ccx = dx1 - 20;
            var ccy = dy1 - 20;
            var bbx = dx2 + 20;
            var bby = dy2 + 20;


            //var bcolor = $("#js-ass").css("background-color")
            //ecf0f1    475763
            g.f("#2d3a44").dr(cx, cy, bx - cx, by - cy);

            //1EBBEA
            g.ss(1).sd([0.5, 4.5], 0).s("#758998");   //画虚线

            for (var wi = dx1; wi <= dx2; wi += 50) {
                g.mt(wi, ccy).lt(wi, bby);
            }
            for (var hi = dy1; hi <= dy2; hi += 50) {
                g.mt(ccx, hi).lt(bbx, hi);
            }

            //for (var wi = cx - 20; wi <= bbx; wi += 50) {
            //    g.mt(wi, ccy).lt(wi, bby);
            //}
            //for (var hi = cy - 20; hi <= bby; hi += 50) {
            //    g.mt(ccx, hi).lt(bbx, hi);
            //}

            g.ss(2).sd([10, 5], 0).s("#ff0000");
            if (cy == -gameheight) {
                g.mt(cx, cy).lt(bx, cy);
            }
            if (bx == gamewidth) {
                g.mt(bx, cy).lt(bx, by);
            }
            if (cx == -gamewidth) {
                g.mt(cx, cy).lt(cx, by);
            }
            if (by == gameheight) {
                g.mt(cx, by).lt(bx, by);
            }

            //if (cy == -gameheight) {
            //    g.mt(cx - 50, cy - 50).lt(bx + 50, cy - 50);
            //}
            //if (bx == gamewidth) {
            //    g.mt(bx + 50, cy - 50).lt(bx + 50, by + 50);
            //}
            //if (cx == -gamewidth) {
            //    g.mt(cx - 50, cy - 50).lt(cx - 50, by + 50);
            //}
            //if (by == gameheight) {
            //    g.mt(cx - 50, by + 50).lt(bx + 50, by + 50);
            //}
            g.f("#ff0000").dr(-1, -1, 2, 2);
        }
        function addEvents() {

            $(document).on("keydown", function (e) {
                if (presskeys[e.which]) {
                    return;
                }
                presskeys[e.which] = true;
                if (e.which == 32) {
                    updateKeyState(2);
                } else {
                    updateKeyState(1);
                }
            });
            $(document).on("keyup", function (e) {
                presskeys[e.which] = false;
                if (e.which == 32) {
                    updateKeyState(2);
                } else {
                    updateKeyState(1);
                }
            });



            var pagemain = document.getElementById("page-main");
            pagemain.addEventListener("touchstart", pagemousemove);
            pagemain.addEventListener("touchmove", pagemousemove);
            pagemain.addEventListener("mousemove", pagemousemove);
            function pagemousemove(e) {
                var x = 0, y = 0;
                if (e.type == "mousemove") {
                    x = e.pageX;
                    y = e.pageY;
                } else if (e.type == "touchstart" || e.type == "touchmove") {
                    var t = e.changedTouches[0];
                    x = t.pageX;
                    y = t.pageY;
                }

                if (pageData.playing) {
                    if (manage.myTang) {
                        var dx = x - (pagew / 2);
                        var dy = y - (pageh / 2);
                        var dr = Math.round(tools.vector2deg(dx, dy));

                        manage.setMyR(dr);
                        //manage.myTang.r = dr;
                        //manage.myTang.updateR();
                    }
                } else {
                    var dx = x - (pagew / 2);
                    var dy = y - (pageh / 2) + 70;
                    var dr = tools.vector2deg(dx, dy);
                    pageData.rotation = dr;
                }


            }

            var onlytouch = false;
            function mousedownFire(e) {
                if (!pageData.playing) {
                    return;
                }
                if (onlytouch && (e.type == "mousedown" || e.type == "mouseup")) {
                    return;
                }

                if (e.type == "touchstart") {
                    onlytouch = true;
                }

                if (e.type == "mousedown" || e.type == "touchstart") {
                    if (e.type == "touchstart") {
                        pagemousemove(e);
                    }

                    if (e.which == 1 || e.which == 0) {
                        presskeys["f"] = true;
                        updateKeyState(2);
                    }


                } else if (e.type == "mouseup" || e.type == "touchend") {
                    if (e.which == 1 || e.which == 0) {
                        presskeys["f"] = false;
                        updateKeyState(2);
                    }
                }
                //e.preventDefault();
                e.stopPropagation();
            }
            canvas.addEventListener("mousedown", mousedownFire);
            canvas.addEventListener("touchstart", mousedownFire);
            canvas.addEventListener("mouseup", mousedownFire);
            canvas.addEventListener("touchend", mousedownFire);
            canvas.oncontextmenu = function (e) {
                e.returnValue = false;
            };
            //$(pagemain).on("mousedown touchstart mouseup touchend", mousedownFire);


            var hmtouch = new Hammer(canvas, {});
            var boffset = { x: 0, y: 0 };
            var canpan = false;
            hmtouch.on("panstart", function (ev) {
                if (!manage.myTang) {
                    canpan = true;
                }
                boffset.x = viewoffset.x;
                boffset.y = viewoffset.y;
            })
            hmtouch.on("pan", function (ev) {
                if (manage.myTang) {
                    viewoffset.x = 0;
                    viewoffset.y = 0;
                    canpan = false;
                }
                if (canpan) {
                    viewoffset.x = boffset.x - ev.deltaX;
                    viewoffset.y = boffset.y - ev.deltaY;
                }
            })
            hmtouch.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 1 });

        }

        var ticknum = 0;
        function tick(event) {  //更新
            if (manage.myTang) {
                viewcenter.x = manage.myTang.model.x;
                viewcenter.y = manage.myTang.model.y;
            }
            mainContainer.x = w / 2 - viewcenter.x - viewoffset.x;
            mainContainer.y = h / 2 - viewcenter.y - viewoffset.y;

            ticknum++;
            if (ticknum % 20 == 0) {
                var x = Math.round((viewcenter.x + viewoffset.x) / 50);
                var y = Math.round((viewcenter.y + viewoffset.y) / 50); //gameheight - 
                $("#js-user-location").text("( x:" + x + ",y:" + y + " )");
                ticknum = 0;
            }

            manage.tick();
            updateBackground();
            stage.update();
        }
        function init() {   //初始化

            stage = new createjs.Stage(canvas);
            //stage = new createjs.SpriteStage(canvas);
            window.manage = manage = new Manage({
                gamewidth: gamewidth,
                gameheight: gameheight,
            });
            window.canvas = canvas;
            stage.autoClear = true;

            mainContainer = new createjs.Container();   //主容器
            bgContainer = new createjs.Container();     //背景容器


            stage.addChild(mainContainer);
            mainContainer.addChild(bgContainer);


            mainContainer.addChild(manage.goodsContainer);
            mainContainer.addChild(manage.tangContainer);
            mainContainer.addChild(manage.shellContainer);

            stage.addChild(manage.map);

            addEvents();

            $(window).resize(resize);
            createjs.Ticker.addEventListener("tick", tick);
            createjs.Ticker.setFPS(10);
            resize();
            testinit();
        }
        function resize() {
            pagew = $body.width();
            pageh = $body.height();

            if (pagew >= 1024 && pagew <= 1920 && pageh >= 700 && pageh <= 1080) {
                var dw = pagew;
                var dh = pageh;
            } else {
                var dw = 1366;
                var dh = 1366;
                var scale = dw / dh;
                var yscale = pagew / pageh;
                if (yscale < scale) {
                    dw = dh * yscale;
                } else if (yscale > scale) {
                    dh = dw / yscale;
                }
            }

            manage.w = canvas.width = w = dw;
            manage.h = canvas.height = h = dh;
        }

        init();
    }).bind(tanggame)(tanggame);






    var tangtang = new Vue({
        el: '#main',
        data: pageData,
    });
    $("#ipt-name").focus();
    $("#page-main").css("opacity", 1);
    $("#btn-start").click(function () {
        tanggame.play(pageData.userName);
    });






})();