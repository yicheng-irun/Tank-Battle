console.log("referee.js   pid:", process.pid);

var fs = require('fs');
var publicfile = fs.readFileSync("wsserver/public.js").toString();
eval(publicfile.toString());

game_env = 2;   //0：客户端   1：main    2:referee

var main = {};
(function (_this) {
    process.on("message", function (m) {
        message(m);
    });
    this.emit = function (title, data) {
        process.send(title + data);
    }
    this.send = function (data) {
        process.send(data);
    }
}).bind(main)(main);

function message(data){
    if (serverEvent[data[0]]) {
        serverEvent[data[0]](data.substr(1));
    }
}

function paimin_sortfun(a, b){
    //return b.gold - a.gold;
    return b.kill - a.kill;
}
function paimin_sort(data){
    var sst = [],tk;
    for (var ti in tankes) {
        tk = tankes[ti];
        if (tk.a) {
            sst.push(tk);
        }
    }
    sst.sort(paimin_sortfun);
    var sobj = "x";
    for (var i = 0;i < sst.length; i++) {
        sobj += sst[i].id;
    }
    main.send(sobj);
}


function update(){
    var now_time = new Date().getTime();
    referee_tick(now_time);
}

setInterval(function () {
    update();
}, 16);

var jp_shuliang = Math.round(game_height * game_width / 80000);
jp_shuliang == 0?jp_shuliang = 1:0;
var wt_shuliang = jp_shuliang * 2;
jp_shuliang *= 1;

setInterval(function () {
    //console.log("log:",tk_count, jp_count,wt_count, zidans.length);
    var jp_count = Object.keys(jiangpins).length;
    var wt_count = Object.keys(wutis).length;
    if (jp_count < jp_shuliang) {
        main.send("y"+String.fromCharCode(jp_shuliang - jp_count));
    }
    if (wt_count < wt_shuliang) {
        main.send("z"+String.fromCharCode(wt_shuliang - wt_count));
    }
}, 500);

setInterval(function () {
    paimin_sort();
}, 3000);


function update_fj() {
    Tank.tick_fj();
}
setInterval(update_fj, 1000);

main.send("g");
main.send("w");