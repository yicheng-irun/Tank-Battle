

        
        var tools = require('./tools.js');
        var GUNS = require('./guns.js');
        var WUTIS = require('./wuti.js');
        var JIANGPINS = require('./jiangpin.js');
        
        var main, ids, jp_ids, wt_ids;
        var game_env = 0;   //0：客户端   1：main    2:referee
        var game_is_ai = false;
        var game_width = 5000, game_height = 5000;
        var dft_speed = 12, dft_add_speed = 8; dfd_speed_t = 8000;
        var dfd_h = 10;

        var tk_juli = 20;
        var tk_jp_juli = tk_juli + 40;

        var ai_m_tank, ai_m_wuti, ai_m_jiangpin;
        var ai_min_tk, ai_min_wt, ai_min_jp;

        
        //is_client = false;
        //is_server = true;
        
        var my_id = "---";
        var my_tank = { x: 0, y: 0, kill: 0 };
        var tankes = {};    //坦克列表
        var zidans = [];    //子弹数组
        var wutis = {};     //物体列表
        var jiangpins = {};   //战利品列表
        var fj_time = 0;

        function ws_open() {

        }
        
        function ws_game_open() {
            pageData.sysstate = 2;
            fj_time = new Date().getTime();
            //js_chat_room.appendTo(js_container);
            //js_chat_msg_cont.scrollTop = js_chat_msg_cont.scrollHeight - js_chat_msg_cont.clientHeight;
        }
        function ws_close() {
            Tank.clear();
            Tank.ifire(false);
            Tank.ipao(0);
            Tank.imove(0);
            JiangPin.clear();
            WuTi.clear();
            gui_clear();
            pageData.sysstate = 0;
            fj_time = 0;

            //js_chat_room.appendTo(js_chat_wrap);
            //js_chat_msg_cont.scrollTop = js_chat_msg_cont.scrollHeight - js_chat_msg_cont.clientHeight;
            //if (pageData.userName == "imai") {
            //    setTimeout(function () {
            //        pagevue.play();
            //    }, 1000);
            //}
        }


        function JiangPin(data) {
            var tp = {
                id: 0, //物品id   1位字符
                t: 1, //类型id  对应JIANGPINS中的类型id
                x: 0,
                y: 0,
                r: 0,   //方向
                rd: 10,  //半径 radius
                v: 0,   //物品的移动速度
                a: true,    //is active
                b: true,    //辅助
                m_t: 0, //上一次移動的時間
                v_v: null,   //速度的基础向量
                z: 0,   //值  金币就表示金币数量
                fj_tk: "",
            }
            for (var i in data)
                if (tp[i] !== undefined)
                    tp[i] = data[i];

            tp.rd = JIANGPINS[tp.t].radius;
            tp.img = JIANGPINS[tp.t].img;

            if (tp.m_t == 0) {
                tp.m_t = new Date().getTime();
            }
            tp.v_v = tools.deg2vector(tp.r);

            for (var gi in tp) {
                this[gi] = tp[gi];
            }

            this.chi = false;
            this.chi_ct = 0.1;

            JiangPin.remove(this.id);
            jiangpins[this.id] = this;
            this.add_fj();
        }
        JiangPin.prototype.remove = function () {
            if (this.model) {
                this.model.destroy({ children: true });
            }
            delete jiangpins[this.id];
            if (game_env == 1) {
                jp_ids.free(this.id);
            }
        }
        JiangPin.prototype.getZipStr = function () {
            if (this.zipstr)
                return this.zipstr
            var str = this.id +
            String.fromCharCode(Math.round(this.x) + 32768) +
            String.fromCharCode(Math.round(this.y) + 32768) +
            String.fromCharCode((this.r << 7) + this.t) +
            String.fromCharCode(this.z)
            return this.zipstr = str;
        }
        JiangPin.prototype.add_fj = function () {
            var tk, fj_ds = Tank.fj_dswj;
            for (var ti in tankes) {
                tk = tankes[ti];
                if (Math.abs(tk.x - this.x) < fj_ds && Math.abs(tk.y - this.y) < fj_ds) {
                    tk.fj_jp += this.id;
                    this.fj_tk += ti;
                }
            }
        }
        JiangPin.add = function (data) {
            return new JiangPin(data);
        }
        JiangPin.random = function (id) {
            var rd1 = Math.random();
            if (rd1 < 0.5) {
                return JiangPin.add({
                    id: id || Math.floor(Math.random() * 100000) + "",
                    x: Math.random() * game_width * 2 - game_width,
                    y: Math.random() * game_height * 2 - game_height,
                    r: Math.floor(Math.random() * 360),
                    t: 0,
                    z: Math.floor(Math.random() * 3) +1,
                });
            } else {
                var rdm = Math.random();
                var t = rdm < 0.4 ? 2 : 1;  //血瓶更少 加速更多
                return JiangPin.add({
                    id: id || Math.floor(Math.random() * 100000) + "",
                    x: Math.random() * game_width * 2 - game_width,
                    y: Math.random() * game_height * 2 - game_height,
                    r: Math.floor(Math.random() * 360),
                    t: t
                });
            }
        }
        JiangPin.randomXY = function (id ,x ,y) {
            var rdm = Math.random();
            var t = rdm < 0.4 ? 2 : 1;

            x > game_width ? x = game_width : (x < -game_width ? x = -game_width : 0);
            y > game_height ? y = game_height : (y < -game_height ? y = -game_height : 0);
            return JiangPin.add({
                id: id || Math.floor(Math.random() * 100000) + "",
                x: x,
                y: y,
                r: Math.floor(Math.random() * 360),
                t: t
            });
        }
        JiangPin.setSpeedUp = function (id, x, y) {
            x > game_width ? x = game_width : (x < -game_width ? x = -game_width : 0);
            y > game_height ? y = game_height : (y < -game_height ? y = -game_height : 0);
            return JiangPin.add({
                id: id || Math.floor(Math.random() * 100000) + "",
                x: x,
                y: y,
                r: Math.floor(Math.random() * 360),
                t: 1,
            });
        }
        JiangPin.setGold = function (id, gold, x, y) {
            var t = 0;
            x > game_width ? x = game_width : (x < -game_width ? x = -game_width : 0);
            y > game_height ? y = game_height : (y < -game_height ? y = -game_height : 0);
            return JiangPin.add({
                id: id || Math.floor(Math.random() * 100000) + "",
                x: x,
                y: y,
                r: Math.floor(Math.random() * 360),
                t: t,
                z: gold,
            });
        }
        JiangPin.setByWu = function (id, wu) {
            var t = 0, g = 1;
            if (WUTIS[wu.t]) {
                if (WUTIS[wu.t].t == 0) {   //金币类
                    g = WUTIS[wu.t].v || 1;
                    return JiangPin.add({
                        id: id || Math.floor(Math.random() * 100000) + "",
                        x: wu.x,
                        y: wu.y,
                        r: Math.floor(Math.random() * 360),
                        t: t,
                        z: g,
                    });
                } else if (WUTIS[wu.t].t == 1) {    //加速加血道具类
                    return JiangPin.randomXY(id, wu.x, wu.y);
                }
            }
            jp_ids.free(id);
        }
        JiangPin.remove = function (jpid) {
            var jp = jiangpins[jpid]
            if (jp) {
                jp.remove();
            }
        }
        JiangPin.clear = function () {
            for (var ti in jiangpins) {
                JiangPin.remove(ti);
            }
        }
        JiangPin.getEffectStr = function (jid, uid) {
            var jp = jiangpins[jid];
            var fj = tankes[uid];
            if (fj) {
                var rtstr = "0";
                if (jp.t == 0) {    //金币
                    fj.gold += jp.z;
                    rtstr = "0" + fj.id + String.fromCharCode(fj.gold);
                } else if (jp.t == 1) {    //加速
                    fj.v = dft_speed + dft_add_speed;
                    fj.v_t = new Date().getTime() + dfd_speed_t;
                    rtstr = "1" + fj.getMoveStr()
                } else if (jp.t == 2) { //加血
                    fj.h += 5;
                    fj.h > dfd_h ? fj.h = dfd_h : 0;
                    rtstr = "2" + fj.id;
                } else if (jp.t == 3) { //加枪
                    var guntype = JIANGPINS[jp.t].value;
                    var gunkey = fj.addGUN(guntype);
                    fj.setGUN(gunkey);
                    rtstr = "3" + fj.id + String.fromCharCode(gunkey);
                }
                JiangPin.remove(jid);
                return jid + rtstr;
            }
            return false;
        }
        JiangPin.loadEffectStr = function (str) {    //加载效果压缩字符串
            var jid = str[0];
            var t = str[1];
            var fjid = str[2];
            var fj = tankes[fjid];
            if (t == "0") {
                if (fj) {
                    fj.gold = str.charCodeAt(3);
                    if (game_env == 0 && my_id == fjid) {
                        gui_ud_gold();
                    }
                }
            } else if (t == "1") {
                var rst = str.substr(2);
                if (fj) {
                    fj.v_t = new Date().getTime() + dfd_speed_t;
                    Tank.loadMoveStr(rst);
                }
            } else if (t == "2") {
                if (fj) {
                    fj.h += 5;
                    fj.h > dfd_h ? fj.h = dfd_h : 0;
                    if (fjid == my_id) {
                        gui_ud_h();
                    }
                }
            } else if (t == "3") {
                var gunkey = str.charCodeAt(3);
                if (fj) {
                    fj.setGUN(gunkey);
                }
            }
            if (fj && game_env == 0 && !game_is_ai) {
                var jp = jiangpins[jid];
                if (jp) {
                    jp.chi = fj;    //被坦克吃掉，向坦克移动过去
                    jp.chi_ct = 1;
                }
            } else {
                JiangPin.remove(jid);
            }
            //console.log(t,jid.charCodeAt(0));
            //JiangPin.remove(jid);
        }
        JiangPin.getZipStr = function (jpid) {
            var jp = jiangpins[jpid];
            if (jp) {
                return jp.getZipStr();
            }
            return false;
        }
        JiangPin.loadZipStr = function (str) {
            var data = {
                id: str[0],
                x: str.charCodeAt(1) - 32768,
                y: str.charCodeAt(2) - 32768,
                t: str.charCodeAt(3) & 127,    //t
                r: str.charCodeAt(3) >> 7,    //r
                z: str.charCodeAt(4)
            };
            return JiangPin.add(data);
        }
        JiangPin.loadZipStrS = function (strs) {
            for (var i = 0; i < strs.length; i += 5) {
                JiangPin.loadZipStr(strs.substr(i, 5));
            }
        }
        JiangPin.tick = function (time) {
            var stime, jp, k, tk, sx, sy;
            for (var ji in jiangpins) {
                jp = jiangpins[ji];
                if (!jp.a) {
                    jp.remove();
                    continue;
                }
                if (jp.v != 0) {
                    stime = time - jp.m_t;
                    jp.x += jp.v_v.x * stime * jp.v * 0.01;
                    jp.y += jp.v_v.y * stime * jp.v * 0.01;
                    jp.m_t = time;
                }
                if (jp.chi) {
                    sx = (jp.chi.x - jp.x) * 0.05;
                    sy = (jp.chi.y - jp.y) * 0.05;
                    jp.x += sx;
                    jp.y += sy;
                    jp.chi_ct -= 0.05;
                    if (jp.chi_ct < 0.1) {
                        jp.a = false;
                    }
                } else if (jp.chi_ct < 1) {
                    jp.chi_ct += 0.05;
                }
                if (game_env == 2) {
                    if (jp.fj_tk) {
                        for (k = 0; k < jp.fj_tk.length; k++) {
                            tk = tankes[jp.fj_tk[k]];
                            if (!tk || !tk.a || tk.h <= 0) {
                                continue;
                            }
                            if (Math.abs(jp.x - tk.x) < tk_jp_juli && Math.abs(jp.y - tk.y) < tk_jp_juli) {   // + jp.rd
                                jp.a = false;
                                main.send("s" + jp.id + tk.id);
                                break;
                            }
                        }
                    }
                    //for (var fi in tankes) {
                    //    fj = tankes[fi];
                    //    if (fj.h <= 0 || !fj.a) {
                    //        continue;
                    //    }
                    //    if (Math.abs(jp.x - fj.x) < tk_jp_juli && Math.abs(jp.y - fj.y) < tk_jp_juli) {   // + jp.rd
                    //        jp.a = false;
                    //        main.send("s" + jp.id + fj.id);
                    //        break;
                    //    }
                    //}
                }
            }
        }
        JiangPin.a_tick = function (time) {
            var stime, jp;
            var juli = Infinity, zuijin = null, njuli;
            for (var ji in jiangpins) {
                jp = jiangpins[ji];
                if (!jp.a) {
                    jp.remove();
                    continue;
                }
                if (jp.v != 0) {
                    stime = time - jp.m_t;
                    jp.x += jp.v_v.x * stime * jp.v * 0.01;
                    jp.y += jp.v_v.y * stime * jp.v * 0.01;

                    jp.m_t = time;
                }
                njuli = Math.abs(jp.x - my_tank.x) + Math.abs(jp.y - my_tank.y);
                if (njuli < juli) {
                    zuijin = jp;
                    juli = njuli;
                }
            }
            ai_m_jiangpin = zuijin;
            ai_min_jp = juli;
        }

        function WuTi(data) {
            this.id = data.id || Math.floor(Math.random() * 100000) + "";   //id
            this.t = data.t || 0;   //物体的类型id
            this.x = data.x != undefined ? data.x : Math.random() * game_width * 2 - game_width; //x
            this.y = data.y != undefined ? data.y : Math.random() * game_height * 2 - game_height; //y
            this.r = data.r || 0;
            this.v_v = tools.deg2vector(this.r);    //移动方向的向量
            this.rd = data.radius || 10;   //半径
            this.v = data.v || 0;

            this.h = data.h || 5;
            this.mh = WUTIS[this.t].h;  //满血值
            this.a = true;
            this.b = true;  //辅助
            this.m_t = new Date().getTime();

            this.img = data.img || null;

            this.fj_tk = "";

            WuTi.remove(this.id);
            wutis[this.id] = this;
            this.add_fj();
        }
        WuTi.prototype.remove = function () {
            if (this.model) {
                this.model.destroy({ children: true });
            }
            delete wutis[this.id];
            if (game_env == 1) {
                wt_ids.free(this.id);
            }
        }
        WuTi.prototype.getZipStr = function () {
            //if (this.v==0 && this.zipstr)
            //    return this.zipstr
            var str = this.id +
            String.fromCharCode(Math.round(this.x) + 32768) +
            String.fromCharCode(Math.round(this.y) + 32768) +
            String.fromCharCode((this.r << 7) + this.t) +
            String.fromCharCode((this.h << 7) + this.rd);
            return this.zipstr = str;
        }
        WuTi.prototype.add_fj = function () {
            var tk, fj_ds = Tank.fj_dswj;
            for (var ti in tankes) {
                tk = tankes[ti];
                if (Math.abs(tk.x - this.x) < fj_ds && Math.abs(tk.y - this.y) < fj_ds) {
                    tk.fj_wt += this.id;
                    this.fj_tk += ti;
                }
            }
        }
        WuTi.add = function (data) {
            return new WuTi(data);
        }
        WuTi.random = function () {
            var num = Math.random();
            var suiji = WUTIS.suiji;
            var t = 0;
            for (var i = 0; i < suiji.length; i += 2) {
                if (num < suiji[i]) {
                    t = suiji[i + 1];
                    break;
                }
            }
            var data = {
                id: wt_ids.getOne(),
                t: t,
                h: WUTIS[t].h,
                radius: WUTIS[t].rd,
                img: WUTIS[t].img
            }
            return new WuTi(data);
        }
        WuTi.remove = function (wid) {
            var wt = wutis[wid];
            if (wt) {
                wt.remove();
            }
        }
        WuTi.clear = function () {
            for (var wi in wutis) {
                WuTi.remove(wi);
            }
        }
        WuTi.getZipStr = function (wid) {
            var wt = wutis[wid];
            if (wt) {
                return wt.getZipStr();
            }
            return "";
        }
        WuTi.loadZipStr = function (str) {
            var data = {
                id: str[0],
                x: str.charCodeAt(1) - 32768,
                y: str.charCodeAt(2) - 32768,
                t: str.charCodeAt(3) & 127,    //t
                r: str.charCodeAt(3) >> 7,    //r
                radius: str.charCodeAt(4) & 127,    //t
                h: str.charCodeAt(4) >> 7,    //r
            };
            data.img = WUTIS[data.t].img;

            return WuTi.add(data);
        }
        WuTi.loadZipStrS = function (strs) {
            for (var i = 0; i < strs.length; i += 5) {
                WuTi.loadZipStr(strs.substr(i, 5));
            }
        }
        WuTi.tick = function (now_time) {
            var wt;
            for (var wi in wutis) {
                wt = wutis[wi];
                if (!wt.a) {
                    wt.remove();
                    continue;
                }
            }
        }
        WuTi.tm = function (now_time) {
            var wt;
            for (var wi in wutis) {
                wt = wutis[wi];
                if (!wt.a) {
                    wt.remove();
                }
            }
        }
        WuTi.a_tick = function (now_time) {
            var wt;
            var juli = Infinity, zuijin = null,njuli;
            for (var wi in wutis) {
                wt = wutis[wi];
                if (!wt.a) {
                    wt.remove();
                    continue;
                }
                njuli = Math.abs(wt.x - my_tank.x) + Math.abs(wt.y - my_tank.y);
                if (njuli < juli) {
                    zuijin = wt;
                    juli = njuli;
                }
            }
            ai_m_wuti = zuijin;
            ai_min_wt = juli;
        }


        function Zidan(data) {
            this.fid = data.fid || 0; //发射着的id
            this.x = data.x || 0;
            this.y = data.y || 0;
            this.r = data.r || 0;   //方向
            this.k = data.k || 1;   //伤害值
            this.v = data.v || 0;   //子弹的速度
            this.a = true    //is active
            this.t = data.t || 1000; //持续时间
            this.s_t = data.s_t || new Date().getTime() //发射时间
            this.m_t = this.s_t //上一次移動的時間
            this.v_v = tools.deg2vector(this.r);   //速度的基础向量
            this.img = data.img || 0; //

            this.fj_tk = data.fj_tk || false;
            this.fj_wt = data.fj_wt || false;
            if (this.fj_wt) {
                this.fj_wt_d = new Array(this.fj_wt.length);
            }

            zidans.push(this);
        }
        Zidan.prototype.remove = function () {
            if (this.model) {
                this.model.destroy({ children: true });
            }
        }
        Zidan.add = function (data) {
            return new Zidan(data);
        }
        Zidan.tick = function (time) {
            var i = 0, zd, stime, fj, wt, tk;
            for (; i < zidans.length; i++) {
                zd = zidans[i];
                stime = time - zd.s_t;
                if (stime > zd.t || !zd.a) {
                    zd.remove();
                    zidans.splice(i, 1);
                    i--;
                    continue;
                }
                stime = time - zd.m_t;
                zd.x += zd.v_v.x * stime * zd.v * 0.01;
                zd.y += zd.v_v.y * stime * zd.v * 0.01;
                zd.m_t = time;
            }


            if (game_env == 0) {    //客户端
                for (i = 0; i < zidans.length; i++) {
                    zd = zidans[i];
                    if (!zd.a) {
                        continue;
                    }
                    for (var fi in tankes) {
                        fj = tankes[fi];
                        if (fj.h <= 0 || fi == zd.fid) {
                            continue;
                        }
                        if (Math.abs(zd.x - fj.x) < tk_juli && Math.abs(zd.y - fj.y) < tk_juli) {
                            zd.a = false;
                            //fj.h -= 1;
                            //fj.h < 0 ? fj.h = 0 : 0;
                            break;
                        }
                    }
                    if (!zd.a) {
                        continue;
                    }
                    for (var wi in wutis) {
                        wt = wutis[wi];
                        if (wt.h <= 0) {
                            continue;
                        }
                        if (Math.max(Math.abs(zd.x - wt.x), Math.abs(zd.y - wt.y)) < wt.rd) {
                            zd.a = false;
                            break;
                        }
                    }
                }
            }
            if (game_env == 2) {    //裁判端
                var k,d,wid;
                for (i = 0; i < zidans.length; i++) {
                    zd = zidans[i];
                    if (!zd.a) {
                        continue;
                    }

                    if (zd.fj_tk) {
                        for (k = 0; k < zd.fj_tk.length; k++) {
                            tk = tankes[zd.fj_tk[k]];
                            if (!tk || tk.h <= 0) {
                                continue;
                            }
                            if (Math.abs(zd.x - tk.x) < tk_juli && Math.abs(zd.y - tk.y) < tk_juli) {
                                zd.a = false;
                                tk.h -= zd.k;
                                if (tk.h <= 0) {
                                    main.send("k" + zd.fid + tk.id);
                                    tk.a = false;
                                    if (tankes[zd.fid]) {
                                        tankes[zd.fid].kill++;
                                    }
                                } else {
                                    main.send("j" + zd.fid + tk.id + String.fromCharCode(tk.h));
                                }
                                break;
                            }
                        }
                    }

                    //for (var ti in tankes) {
                    //    fj = tankes[ti];
                    //    if (fj.h <= 0 || ti == zd.fid) {
                    //        continue;
                    //    }
                    //    if (Math.abs(zd.x - fj.x) < tk_juli && Math.abs(zd.y - fj.y) < tk_juli) {
                    //        zd.a = false;
                    //        fj.h -= zd.k;
                    //        if (fj.h <= 0 ) {
                    //            main.send("k" + zd.fid + fj.id);
                    //            fj.a = false;
                    //            if (tankes[zd.fid]) {
                    //                tankes[zd.fid].kill++;
                    //            }
                    //        } else {
                    //            main.send("j" + zd.fid + fj.id + String.fromCharCode(fj.h));
                    //        }
                    //        break;
                    //        //fj.h < 0 ? fj.h = 0 : 0;
                    //    }
                    //}
                    if (!zd.a) {
                        continue;
                    }
                    if (zd.fj_wt) {
                        for (k = 0; k < zd.fj_wt.length; k++) {
                            wid = zd.fj_wt[k];
                            wt = wutis[wid];
                            if (!wt || !wt.a || wt.h <= 0) {
                                zd.fj_wt.replace(wid, "");
                                zd.fj_wt_d.splice(k, 1);
                                continue;
                            }
                            d = Math.max(Math.abs(zd.x - wt.x), Math.abs(zd.y - wt.y))
                            if (d < wt.rd) {
                                zd.a = false;
                                wt.h -= zd.k;
                                if (wt.h <= 0) {
                                    main.send("i" + zd.fid + wt.id);
                                    wt.a = false;
                                } else {
                                    main.send("h" + zd.fid + wt.id + String.fromCharCode(wt.h));
                                }
                                break;
                            } else if (zd.fj_wt_d[k] == undefined) {
                                zd.fj_wt_d[k] = d;
                            } else if (zd.fj_wt_d[k] != undefined) {
                                if (d > zd.fj_wt_d[k]) {
                                    zd.fj_wt.replace(wid, "");
                                    zd.fj_wt_d.splice(k, 1);
                                } else {
                                    zd.fj_wt_d[k] = d;
                                }
                            }
                            
                        }
                    }
                    //console.log("============")
                    //for (var wi in wutis) {
                    //    wt = wutis[wi];
                    //    if (wt.h <= 0) {
                    //        continue;
                    //    }
                    //    if (Math.max(Math.abs(zd.x - wt.x), Math.abs(zd.y - wt.y)) < wt.rd) {
                    //        zd.a = false;

                    //        wt.h -= zd.k;
                    //        if (wt.h <= 0) {
                    //            main.send("i" + zd.fid + wt.id);
                    //            wt.a = false;
                    //        } else {
                    //            main.send("h" + zd.fid + wt.id + String.fromCharCode(wt.h));
                    //        }

                    //        break;
                    //    }
                    //}
                }
            }
        }


        function Tank(data) {
            this.id = data.id || Math.floor(Math.random() * 100000) + "";   //id
            this.n = data.n || (game_env==1?"nameless":null);    //名字
            this.x = data.x != undefined ? data.x : Math.random() * game_width * 2 - game_width; //x
            this.y = data.y != undefined ? data.y : Math.random() * game_width * 2 - game_width; //y
            this.r = data.r || 0;   //移动方向 0表示不移动
            this.c_r = this.r+1;  //过渡r
            this.v_v = tools.deg2vector(this.r);    //移动方向的向量
            this.m_t = new Date().getTime();  //移动时间
            this.mt_pst = {x:0,y:0};    //途经点模式的目标坐标
            this.mt_t = 0;           //途径点模式的到达目标时间

            this.p = data.p!=undefined?data.p : 0;   //炮口方向
            this.c_p = this.p+1;  //model的炮口方向过渡
            this.v_p = tools.deg2vector(this.p);    //坦克的炮塔方向的向量 主要用于向量和
            this.v = data.v || dft_speed;   //速度       0-63;
            this.v_t = data.v_t || 0;       //加速效果的结束时间
            this.h = data.h || dfd_h;
            this.a = data.a || true;

            this.gun = data.gun || 0;   //枪的种类
            this.wp = null,   //武器weapon
            this.f = data.f||false;    //开火状态
            this.f_t = data.f_t || 0;  //设置开火时间


            this.s_v = 0;   //移动速度加点
            this.s_h = 0;   //生命值加点
            this.s_k = 0;   //伤害值加点
            this.s_p = 0;   //射击速度加点
            this.s_j = 0;   //射击距离加点

            this.lv = 0;    //等级
            this.score = 0; //分数
            this.kill = 0;  //杀敌
            this.gold = 0;  //金币

            this.skin = 0;

            this.fj_tk = "";
            this.fj_wt = "";
            this.fj_jp = "";

            this.setR(this.r);

            Tank.remove(this.id);
            tankes[this.id] = this;
            if (this.id == my_id) {
                my_tank = this;
                this.n = pageData.userName;
            }
        }
        Tank.prototype.setR = function (r) {    //设置自己的方向
            this.r = r;
            if (r == 0) {
                this.v_v.x = this.v_v.y = 0;
            }else
                tools.deg2vector(this.r, this.v_v);
        }
        Tank.prototype.setP = function (p) {    //设置自己的炮口方向
            this.p = p;
            tools.deg2vector(this.p, this.v_p);
        }
        Tank.prototype.addGUN = function (gunstr) { //拾取枪的时候，计算下一把是啥枪
            var gid = this.gun;
            var gunobj = GUNS[gid];
            if (gunobj.code == gunstr) {
                return gunobj.next;
            } else {
                var k = gunobj[gunstr]
                if (gunobj[k]) {
                    return k;
                }
            }
            return this.gun;
        }
        Tank.prototype.setGUN = function (guncode) {    //设置自己的gun
            if (this.gun != guncode) {
                this.wp = null;
                this.gun = guncode;
                if (this.paota) {
                    this.paota.destroy({ children: true });
                    this.paota = null;
                }
            }
        }
        Tank.prototype.setF = function (f) {
            if (f) {
                //this.f_t = 0;
                if (this.wp) {
                    var fsf = this.wp.fires[0];
                    var fsn;
                    var time = new Date().getTime();
                    if (fsf) {
                        if (time > fsf.f_t) {
                            fsf.f_t = time + fsf.st;
                            for (var fi = 1; fi < this.wp.fires.length; fi++) {
                                fsn = this.wp.fires[fi];
                                fsn.f_t = time + fsn.st;
                            }
                        }
                    }
                }
            }
            this.f = f;
        }
        Tank.prototype.setGold = function (gold) {
            this.gold = gold;
            if (game_env == 0 && my_id == this.id) {
                gui_ud_gold();
            }
        }
        Tank.move_once_time = 2000;   //一次移动信息对应的时间
        Tank.prototype.move_once_time = Tank.move_once_time;   //一次移动信息对应的时间
        Tank.prototype.getMoveStr = function (r) {
            if (r !== undefined) {
                if (r == 0) {
                    if (game_env == 1) {
                        this.r = r;
                    }
                    this.v_v.x = this.v_v.y = 0;
                } else {
                    this.r = r;
                    tools.deg2vector(this.r, this.v_v);
                }
            }
            this.mt_t = new Date().getTime() + Tank.move_once_time;
            return this.id +
                String.fromCharCode(Math.round(this.x) + 32768) +
                String.fromCharCode(Math.round(this.y) + 32768) +
                String.fromCharCode((this.r << 6) + this.v);
        }
        Tank.prototype.getZipStr = function () {
            var str = this.id +
                String.fromCharCode(Math.round(this.x) + 32768) +
                String.fromCharCode(Math.round(this.y) + 32768) +
                String.fromCharCode((this.r<<6) + this.v) +
                String.fromCharCode(Math.floor(this.p)) +
                String.fromCharCode(Math.floor(this.h)) +
                String.fromCharCode((this.gun << 1) + (this.f ? 1 : 0));  //用gun id 左移一位判断开火状态
            return str;
        }
        Tank.prototype.remove = function () {
            if (this.model) {
                this.model.destroy({ children: true });
            }
            delete tankes[this.id];
            if (game_env == 1) {
                ids.free(this.id);
            }
        }
        Tank.prototype.add_fj = function () {   //算出附近的信息
            var tk, fj_ds = Tank.fj_ds;
            var wt, jp;
            for (var ti in tankes) {
                tk = tankes[ti];
                if (Math.abs(tk.x - this.x) < fj_ds && Math.abs(tk.y - this.y) < fj_ds && ti != this.id) {
                    tk.fj_tk += this.id;
                    this.fj_tk += ti;
                }
            }
            fj_ds = Tank.fj_dswj;
            for (var wi in wutis) {
                wt = wutis[wi];
                if (Math.abs(tk.x - wt.x) < fj_ds && Math.abs(tk.y - wt.y) < fj_ds) {
                    wt.fj_tk += this.id;
                    tk.fj_wt += wi;
                }
            }
            for (var ji in jiangpins) {
                jp = jiangpins[ji];
                if (Math.abs(tk.x - jp.x) < fj_ds && Math.abs(tk.y - jp.y) < fj_ds) {
                    jp.fj_tk += this.id;
                    tk.fj_jp += ji;
                }
            }
        }
        Tank.add = function (data) {
            return new Tank(data);
        }
        Tank.getMoveStr = function (tkid, r) {
            var tk = tankes[tkid];
            if (tk) {
                return tk.getMoveStr(r);
            }
            return null;
        }
        Tank.loadMoveStr = function (str) {
            var id = str[0];
            var x = str.charCodeAt(1) - 32768;    //x
            var y = str.charCodeAt(2) - 32768;    //y
            var r = str.charCodeAt(3);    //r
            var v = r & 63;    //v
            r = r >> 6;


            var tk = tankes[id];
            if (tk) {
                tk.v = v;
                if (r == 0) {
                    tk.v_v.x = tk.v_v.y = 0;
                    tk.mt_pst.x = x;
                    tk.mt_pst.y = y;
                } else {
                    tk.r = r;
                    tools.deg2vector(tk.r, tk.v_v);
                    tk.mt_pst.x = x + tk.v_v.x * Tank.move_once_time * tk.v * 0.01;
                    tk.mt_pst.y = y + tk.v_v.y * Tank.move_once_time * tk.v * 0.01;
                }
                tk.mt_t = new Date().getTime() + Tank.move_once_time;
                return tk;
            }
            return false;
        }
        Tank.getZipStr = function (id) {
            var tk = tankes[id];
            if (tk) {
                return tk.getZipStr();
            }
            return "";
        }
        Tank.loadZipStr = function (str) {
            var data = {
                id: str[0],
                x: str.charCodeAt(1) - 32768,
                y: str.charCodeAt(2) - 32768,
                r: str.charCodeAt(3),
                p: str.charCodeAt(4),
                h: str.charCodeAt(5),
                f: !!(str.charCodeAt(6) & 1),
                gun: str.charCodeAt(6) >> 1
            }
            data.v = data.r & 63;
            data.r = data.r >> 6;
            if (game_env == 0) {
                setTimeout(function () {
                    if(tankes[data.id])
                        socket.emit("n", data.id);
                },1000)
            }
            //if (game_env == 2) {
            //    main.send("n" + data.id);
            //}
            var tk = Tank.add(data);
            if (game_env == 2) {
                tk.add_fj();
            }
        }
        Tank.loadZipStrS = function (strs) {
            for (var i = 0; i < strs.length; i += 8) {
                Tank.loadZipStr(strs.substr(i, 7));
            }
        }
        Tank.remove = function (tkid) {
            var tk = tankes[tkid];
            if (tk) {
                tk.remove();
            }
        }
        Tank.clear = function () {
            for (var ti in tankes) {
                tankes[ti].remove();
            }
        }
        Tank.setGUN = function (tkid, guncode) {
            var tk = tankes[tkid];
            if (tk) {
                tk.setGUN(guncode);
            }
        }
        Tank.imove = (function(){
            var sending_r = 0;
            var issending_r = false;
            return function (r) {  //移动方向
                r = Math.round(r)
                if (sending_r != r) {
                    sending_r = r;
                    if (!issending_r) {
                        issending_r = true;
                        setTimeout(function () {
                            socket.emit("r", String.fromCharCode(sending_r));
                            issending_r = false;
                        }, 60);
                    }
                }
            }
        })();
        Tank.ipao = (function(){
            var sending_p = 0;
            var issending_p = false;
            return function (p) {   //炮口方向
                p = Math.round(p)
                if (sending_p != p) {
                    sending_p = p;
                    if (!issending_p) {
                        issending_p = true;
                        setTimeout(function () {
                            socket.emit("p", String.fromCharCode(sending_p));
                            issending_p = false;
                        }, 130);
                    }
                }
            }
        })();
        Tank.setFireState = function (tkid, f) {
            var tk = tankes[tkid];
            if (tk) {
                tk.setF(f);
            }
        }
        Tank.ibg = function (id) {
            id -= 0;
            var gstr = String.fromCharCode(id);
            socket.emit("d", gstr);
        };
        Tank.ifire = (function () {
            var sending_f = false;
            return function (isfire) {
                if (isfire != sending_f) {
                    sending_f = isfire;
                    if (sending_f) {
                        socket.emit("f", "");
                    } else {
                        socket.emit("e", "");
                    }
                    //socket.emit("f", sending_f ? String.fromCharCode(1) : String.fromCharCode(0));
                }
            }
        })();
        Tank.tickFire = function (time) {
            var tk, i, fires, fri, fx, fy,fc;
            for (var ti in tankes) {
                tk = tankes[ti];
                if (tk.h <= 0 || !tk.f) {
                    continue;
                }
                if (!tk.wp) {
                    tk.wp = tools.clone(GUNS[tk.gun]);
                    for (var fi = 0; fi < tk.wp.fires.length; fi++) {
                        fri = tk.wp.fires[fi];
                        fri.f_t = time + fri.st;
                    }

                    //tk.wp.count = -1;    //开火计量
                }
                
                for (var fi in tk.wp.fires) {
                    fc = tk.wp.fires[fi];
                    if (time >= fc.f_t) {
                        fc.f_t = time - ((time - fc.f_t) % fc.tt) + fc.tt;
                        
                        if (fc.fr != tk.p) {
                            fc.fr = tk.p;
                            fc.fx = fc.tx * tk.v_p.x - fc.ty * tk.v_p.y;
                            fc.fy = fc.tx * tk.v_p.y + fc.ty * tk.v_p.x;
                        }

                        fx = fc.fx + tk.x;
                        fy = fc.fy + tk.y;

                        if (game_env == 0) {
                            Zidan.add({
                                fid: tk.id,
                                x: fx,
                                y: fy,
                                r: tk.p + fc.tr,
                                k: fc.k || 1,
                                t: fc.ct || 1000, //持续时间
                                v: fc.v || 40,
                                s_t: time,
                                img: fc.img || "zd0"
                            });
                        }

                        if (game_env == 2) {
                            Zidan.add({
                                fid: tk.id,
                                x: fx,
                                y: fy,
                                r: tk.p + fc.tr,
                                k: fc.k || 1,
                                t: fc.ct || 1000, //持续时间
                                v: fc.v || 40,
                                s_t: time,
                                fj_tk: tk.fj_tk,
                                fj_wt: tk.fj_wt,
                            });
                        }


                    }



                }

                //if (time >= tk.f_t) {
                //    //if (tk.f_t > 0) {
                //    //    tk.f_t = time - ((time - tk.f_t) % tk.wp.tt) + tk.wp.tt;
                //    //} else {
                //        //tk.f_t = time + tk.wp.tt;
                //    //}
                //    tk.f_t = time - ((time - tk.f_t) % tk.wp.tt) + tk.wp.tt;
                //    fires = tk.wp.fires;
                //    for (i = 0; i < fires.length; i++) {
                //        fri = fires[i]  //火力点
                //        if (fri.fr != tk.p) {
                //            fri.fr = tk.p;
                //            fri.fx = fri.tx * tk.v_p.x - fri.ty * tk.v_p.y;
                //            fri.fy = fri.tx * tk.v_p.y + fri.ty * tk.v_p.x;
                //        }
                //        //此处可进行缓冲优化
                //        fx = fri.fx + tk.x;
                //        fy = fri.fy + tk.y;
                //        if (game_env == 0) {
                //            Zidan.add({
                //                fid: tk.id,
                //                x: fx,
                //                y: fy,
                //                r: tk.p + fri.tr,
                //                k: fri.k || tk.wp.k || 1,
                //                t: fri.ct || tk.wp.ct || 1000, //持续时间
                //                v: fri.v || tk.wp.v,
                //                s_t: time,
                //                img: fri.img || tk.wp.img
                //            });
                //        }
                //        if (game_env == 2) {
                //            Zidan.add({
                //                fid: tk.id,
                //                x: fx,
                //                y: fy,
                //                r: tk.p + fri.tr,
                //                k: fri.k || tk.wp.k || 1,
                //                t: fri.ct || tk.wp.ct || 1000, //持续时间
                //                v: fri.v || tk.wp.v,
                //                s_t: time,
                //                img: fri.img || tk.wp.img,
                //                fj_tk: tk.fj_tk,
                //                fj_wt: tk.fj_wt,
                //            });
                //        }
                //    }
                //}

            }
        }
        Tank.tickMove = function (now_time) {
            var stime, tk, fx, fy;
            var width = game_width + 100;
            var height = game_height + 100;
            for (var ti in tankes) {
                tk = tankes[ti];
                if (!tk.a) {
                    tk.remove();
                    continue;
                }
                if (tk.mt_t > tk.m_t) {
                    stime = tk.mt_t - tk.m_t;
                    fx = tk.mt_pst.x - tk.v_v.x * stime * tk.v * 0.01;
                    fy = tk.mt_pst.y - tk.v_v.y * stime * tk.v * 0.01;
                    tk.x += (fx - tk.x) / 5;
                    tk.y += (fy - tk.y) / 5;
                } else {
                    stime = now_time - tk.m_t;
                    tk.x += tk.v_v.x * stime * tk.v * 0.01;
                    tk.y += tk.v_v.y * stime * tk.v * 0.01;
                    if (game_env == 0 && tk.mt_t != 0 && tk.mt_t - tk.m_t < -3000 && tk.h > 0) {
                        tk.remove();
                    }
                }
                tk.m_t = now_time;

                if (game_env == 0) {
                    if (ti == my_id && my_tank != tk) {
                        my_tank = tk;
                        tk.n = pageData.userName;
                    }

                }
                if (game_env == 2) {
                    if (tk.x > width || tk.x < -width || tk.y > height || tk.y < -height) {
                        main.send("k" + tk.id + tk.id);
                        tk.a = false;
                    }
                }
            }

        }
        Tank.tickMainMove = function (now_time) {
            var stime, tk;
            for (var ti in tankes) {
                tk = tankes[ti];
                if (!tk.a) {
                    tk.remove();
                    continue;
                }
                stime = now_time - tk.m_t;
                if (tk.r != 0) {
                    tk.x += tk.v_v.x * stime * tk.v * 0.01;
                    tk.y += tk.v_v.y * stime * tk.v * 0.01;
                }
                tk.m_t = now_time;
            }
        }
        Tank.tickAI = function (time) {
            //return;
            //var myfeiji = tankes[my_id];
            //if (myfeiji && myfeiji.a) {

            //    var n_pst = tools.deg2vector(myfeiji.r);
            //    n_pst.x = n_pst.x * 30 + myfeiji.x;
            //    n_pst.y = n_pst.y * 30 + myfeiji.y;

            //    if (Math.abs(n_pst.x) > game_width || Math.abs(n_pst.y) > game_height) {
            //        var n_x = Math.random() * game_width - game_width / 2;
            //        var n_y = Math.random() * game_height - game_height / 2;
            //        var n_r = tools.vector2deg(n_x - myfeiji.x, n_y - myfeiji.y);
            //        Tank.imove(n_r)
            //    }
            //}
        }
        Tank.a_tick = function (now_time) {
            var stime, tk, fx, fy;
            //var width = game_width + 100;
            //var height = game_height + 100;
            var juli = Infinity, zuijin = null, njuli;
            for (var ti in tankes) {
                tk = tankes[ti];
                if (!tk.a) {
                    tk.remove();
                    continue;
                }
                if (tk.mt_t > tk.m_t) {
                    stime = tk.mt_t - tk.m_t;
                    fx = tk.mt_pst.x - tk.v_v.x * stime * tk.v * 0.01;
                    fy = tk.mt_pst.y - tk.v_v.y * stime * tk.v * 0.01;
                    tk.x += (fx - tk.x) / 5;
                    tk.y += (fy - tk.y) / 5;
                } else {
                    stime = now_time - tk.m_t;
                    tk.x += tk.v_v.x * stime * tk.v * 0.01;
                    tk.y += tk.v_v.y * stime * tk.v * 0.01;
                    if (game_env == 0 && tk.mt_t != 0 && tk.mt_t - tk.m_t < -3000 && tk.h > 0) {
                        tk.remove();
                    }
                }
                tk.m_t = now_time;

                if (ti == my_id && my_tank != tk) {
                    my_tank = tk;
                }

                if (ti != my_id) {
                    njuli = Math.abs(tk.x - my_tank.x) + Math.abs(tk.y - my_tank.y);
                    if (njuli < juli) {
                        zuijin = tk;
                        juli = njuli;
                    }
                }
            }
            ai_m_tank = zuijin;
            ai_min_tk = juli;
        }
        Tank.fj_ds = 1200;
        Tank.fj_dswj = 800;
        Tank.tick_fj = function () {
            var tk, tk2, tkeys,fj_ds = Tank.fj_ds;
            tkeys = Object.keys(tankes);
            var t_1 = tkeys.length - 1;
            for (var ti in tankes) {
                tk = tankes[ti];
                tk.fj_tk = "";
                tk.fj_wt = "";
                tk.fj_jp = "";
            }
            for (var i = 0; i < t_1; i++) {
                tk = tankes[tkeys[i]];
                for (var j = i + 1; j < tkeys.length; j++) {
                    tk2 = tankes[tkeys[j]];
                    if (Math.abs(tk.x - tk2.x) < fj_ds && Math.abs(tk.y - tk2.y) < fj_ds) {
                        tk.fj_tk += tkeys[j];
                        tk2.fj_tk += tkeys[i];
                    }
                }
            }
            fj_ds = Tank.fj_dswj;
            var wt;
            for (var wi in wutis) {
                wt = wutis[wi];
                wt.fj_tk = "";
                for (var ti in tankes) {
                    tk = tankes[ti];
                    if (Math.abs(tk.x - wt.x) < fj_ds && Math.abs(tk.y - wt.y) < fj_ds) {
                        wt.fj_tk += ti;
                        tk.fj_wt += wi;
                    }
                }
            }
            var jp;
            for (var ji in jiangpins) {
                jp = jiangpins[ji];
                jp.fj_tk = "";
                for (var ti in tankes) {
                    tk = tankes[ti];
                    if (Math.abs(tk.x - jp.x) < fj_ds && Math.abs(tk.y - jp.y) < fj_ds) {
                        jp.fj_tk += ti;
                        tk.fj_jp += ji;
                    }
                }
            }
        }
        Tank.tick_fj_t = function () {

        }


        function tick() {
            var now_time = new Date().getTime();
            Tank.tickMove(now_time);
            JiangPin.tick(now_time);
            WuTi.tick(now_time);
            Zidan.tick(now_time);
            Tank.tickFire(now_time);
            Tank.tickAI(now_time);
            if (fj_time != 0 && now_time - fj_time > 1000) {
                socket.emit("C","");
                fj_time = now_time;
            }
        }

        function main_tick(now_time) {
            Tank.tickMainMove(now_time);
            WuTi.tm(now_time);
            //Tank.tick_fj();
        }
        function referee_tick(now_time) {
            Tank.tickMove(now_time);
            JiangPin.tick(now_time);
            WuTi.tick(now_time);
            Zidan.tick(now_time);
            Tank.tickFire(now_time);
        }


        function serverMessage(data) {
            if (serverEvent[data[0]]) {
                serverEvent[data[0]](data.substr(1));
            }
        }
        var serverEvent = {
            a: function () {    //服务器发过来的准备通知
                socket.emit("a", pageData.userName);
            },
            b: function (data) {    //收到id，设置自己的id
                my_id = data;
                ws_game_open();
                socket.emit("g", "");
                socket.emit("w", "");
            },
            c: function (data) {    //收到服务器发送过来的飞机信息
                Tank.loadZipStrS(data);
            },
            d: function (data) {       //收到服务器用户断开连接的信息
                Tank.remove(data);
            },
            e: function (data) {       //关火指令
                Tank.setFireState(data, false);
            },
            f: function(data){      //开火指令
                Tank.setFireState(data, true);
            },
            g:function(data){   //服务器发送过来的战利品信息
                JiangPin.loadZipStrS(data);
            },
            h: function (data) {    //击中物品
                if (game_env == 0) {
                    var wid = data[1];
                    var h = data.charCodeAt(2);
                    var wt = wutis[wid]
                    if (wt) {
                        wt.h = h;
                    }
                }
            },
            i: function (data) {    //击杀物品
                if (game_env == 0) {
                    var wid = data[1];
                    var wt = wutis[wid]
                    if (wt) {
                        wt.h = 0;
                        wt.a = false;
                    }
                }
            },
            j: function (data) {    //击中
                if (game_env == 0) {
                    var fid = data[1];
                    var h = data.charCodeAt(2);
                    var fj = tankes[fid]
                    if (fj) {
                        fj.h = h;
                        if (game_env == 0 && fid == my_id) {
                            gui_ud_h();
                        }
                    }
                }
            },
            k: function (data) {    //击杀
                if (game_env == 0) {
                    var yid = data[0];
                    var fid = data[1];
                    var kname;
                    var fj = tankes[fid];
                    
                    if (fj) {
                        fj.h = 0;
                        kname = fj.n || "player:" + fid.charCodeAt(0);
                    } else {
                        kname = "player:" + fid.charCodeAt(0);
                    }
                    if (yid == my_id) {
                        gui_show_kill("YOU", kname);
                        my_tank.kill++;
                    }
                    if (game_env == 0 && fid == my_id) {
                        gui_ud_h();
                    }
                }
            },
            m: function (data) {    //移动指令
                var fj = tankes[data.substr(0, 1)];
                if (fj) {
                    Tank.loadMoveStr(data);
                } else {
                    if (game_env === 0) {
                        var id = data.substr(0, 1)
                        socket.emit("c", id);
                    }
                }
            },
            n: function (data) {       //服务器返回的用户名称
                var id = data[0];
                var name = data.substr(1);
                if (tankes[id]) {
                    tankes[id].n = name;
                }
            },
            p: function (data) {    //服务器发送过来的用户的炮口方向信息
                var fj = tankes[data[0]];
                if (fj) {
                    fj.setP(data.charCodeAt(1))
                }
            },
            r: function (data) {    //转向指令  暂时弃用
                var fj = tankes[data[0]];
                if (fj) {
                    fj.setR(data.charCodeAt(1))
                } else {
                    if (game_env === 0)
                        socket.emit("c", data.substr(0, 1));
                }
            },
            s: function (data) {    //捡到物品
                JiangPin.loadEffectStr(data);
            },
            t: function (data) {
                var tid = data[0];
                var gid = data.charCodeAt(1);
                var gold = data.charCodeAt(2);
                var tk = tankes[tid]
                if (tk) {
                    tk.setGUN(gid);
                    tk.setGold(gold);
                }

            },
            w: function (data) {   //服务器发送过来的物品信息
                WuTi.loadZipStrS(data);
            },
            x: function (data) {    //设置自己的名次
                if (game_env == 0) {
                    my_tank.idx = data.charCodeAt(0);
                }
            },
            y: function (data) {    //设置排行榜
                if (game_env == 0) {
                    gui_ud_rank(data);
                }
            },
            C:function(data){
                var len = data.charCodeAt(0);
                var wts = data.substr(1, len);
                var jps = data.substr(len + 1);
                my_tank.fj_wt = wts;
                my_tank.fj_jp = jps;

                var wt, jp, nwt = "", njp = "";
                for (var ti in wutis) {
                    wt = wutis[ti];
                    wt.b = false;
                }
                for (var i = 0; i < wts.length; i++) {
                    wt = wutis[wts[i]];
                    if (wt) {
                        wt.b = true;
                    } else {
                        nwt += wts[i];
                    }
                }
                for (var ti in wutis) {
                    wt = wutis[ti];
                    if(!wt.b)
                        wt.a = false;
                }

                for (var ji in jiangpins) {
                    jp = jiangpins[ji];
                    jp.b = false;
                }
                for (var i = 0; i < jps.length; i++) {
                    jp = jiangpins[jps[i]];
                    if (jp) {
                        jp.b = true;
                    } else {
                        njp += jps[i];
                    }
                }
                for (var ji in jiangpins) {
                    jp = jiangpins[ji];
                    if (!jp.b&&!jp.chi)
                        jp.a = false;
                }
                //console.log(wts.length, jps.length,nwt.length,njp.length);

                var str = String.fromCharCode(nwt.length) + nwt;
                str += njp;
                if (str.length > 1) {
                    socket.emit("D", str);
                }
            },
            D: function (data) {
                var len = data.charCodeAt(0);
                var wts = data.substr(1, len);
                var jps = data.substr(len + 1);
                WuTi.loadZipStrS(wts);
                JiangPin.loadZipStrS(jps);
            }
        }

        