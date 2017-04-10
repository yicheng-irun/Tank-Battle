var child_process = require('child_process');
var Buffer = require('buffer').Buffer;

/**
 *
 *
 *
 *
 *
 *
 */

console.log("aim", process.pid);

var clist = [];
var namelist = [
    "嘿嘿",
    "asfadf",
    "你该吃药了··",
    "来一炮",
    "hfghj",
    "gdsf",
    "halise",
    "((()))fsdf",
    "O(∩_∩)O↑~",
    "双丰收",
    "----sdfs",
    " s  sfsf",
    "756757",
    "我不是黄蓉",
    "我不会武功",
    "gank",
    "carry you",
    "叮叮当",
    "铃儿响订单",
    "药不能停~药不能停",
];

process.stdin.on("readable", function () {
    var chunk = process.stdin.read();
    if (chunk instanceof Buffer) {
        var data = chunk.toString();
        data = data.substr(0, data.length - 2);
        if (data == "") {
            addRun();
        } else if (data[0] == "+") {
            var num = data.substr(1);
            if (num == "") {
                addRun();
            } else {
                num -= 0;
                for (var i = 0; i < num && i < 60; i++) {
                    addRun();
                }
            }
        } else if (data[0] == "-") {
            var num = data.substr(1);
            if (num == "") {
                subRun();
            } else {
                num -= 0;
                for (var i = 0; i < num && i < 60; i++) {
                    subRun();
                }
            }
        } else if (data == "1") {
            console.log(clist.length);
        }
    }
});


function addRun(){
    var aic = child_process.fork("wsserver/ai.js");
    aic.on('message', aicMessage);
    var obj = {
        pid: aic.pid,
        aic: aic,
        name: namelist[ Math.floor(Math.random() * namelist.length)],
    }
    aic.send("n" + obj.name);
    console.log("aia", obj.pid);
    clist.push(obj);
}
function subRun(){
    var obj = clist.pop();
    if (obj) {
        if (!obj.aic.killed) {
            process.kill(obj.aic.pid);
        }
        console.log("ais", obj.pid," 剩下",clist.length);
    }
}

function aicMessage(data) {
    console.log('P->', data);
}


//addRun();

//var ai = require('./wsserver/ai.js');