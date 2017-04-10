var Thing = {};
if (!this.window) {
    var tools = require('../../wsserver/tools.js');
}



function BaseThing(data) {
    this.id = "";
    this.x = 0;
    this.y = 0;
    this.v = 1;     //速度
    this.m = 360;     //移动方向
    this.m_time = 0;
    this._m_vector = { x: 0, y: 0 };    //基础的移动
}

BaseThing.prototype = {
    constructor: BaseThing,
    moveM: function (value) {
        this.calcuLoc();
        this.m = value;
        this._m_vector = tools.deg2vector(this.m);
    },
    moveTime:2000,
    moveTo: function (x, y) {

    },
    calcuLoc: function () {     //计算位置
        var ntime = new Date().getTime();
        if (this._m != 360) {
            var sbtime = (ntime - this.m_time) / 10;
            this.x += this._m_vector.x * this.v * sbtime;
            this.y += this._m_vector.y * this.v * sbtime;
            this.m_time = ntime;
        } else { 
            this.m_time = ntime;
        }
    },

}

var mainidcount = 0;
var feiji_idlist = {};
function newMainID() {
    var num = ++ mainidcount;
    var result = String.fromCharCode(num & 127) + String.fromCharCode(((num >> 7) & 127) + 128);
    console.log(mainidcount & 127, ((num >> 7) & 127) + 128, num);
    if ((num>>14) > 0) {
        mainidcount = 0;
    }
    return result;
}

function getAfeijiID() {
    var id = newMainID();
    while (feiji_idlist[id]) { 
        id = newMainID();
    }
    return id;
}

function FeiJi(data) {
    BaseThing.call(this);

    this.bv = 1;    //基础速度
    this.effects = [];
    
    this.exp = 0;
    this.level = 1;
    this.health = 10;
    this.gun = 20;           //默认枪
    this.skin = 40;
    this.end = false;

    this.zipStr = "";
    this.nearbyIDs = "";

    if (data.id != undefined) {
        this.id = data.id;
    } else {
        this.id = getAfeijiID();
        feiji_idlist[this.id] = true;
    }
}

FeiJi.prototype = Object.create(BaseThing.prototype);
FeiJi.prototype.constructor = FeiJi;
FeiJi.prototype.loadZipStr = function () { 

}
FeiJi.prototype.exportZipStr = function () {

}
FeiJi.prototype.hintBy = function (shell) {
    this.health -= shell.k;
    if (this.health <= 0) {
        this.end = true;
        this.gameover();
    }
}
FeiJi.prototype.gameover = function () { 
    delete feiji_idlist[this.id];
}


var sidcount = 0;
function newShellID () {
    var num = ++sidcount;
    var result = String.fromCharCode(num & 255) + String.fromCharCode((num >> 8) & 255);
    if ((num >> 16) > 0) {
        sidcount = 0;
    }
    return result;
}

function Shell(data) {
    BaseThing.call(this);

    this.v = 5;
    this.k = 1;     //伤害值

}

Shell.prototype = Object.create(BaseThing.prototype);
Shell.prototype.constructor = Shell;



function Goods(data) {
    BaseThing.call(this);
    
    this.type = 1;  
    
}

Goods.prototype = Object.create(BaseThing.prototype);
Goods.prototype.constructor = Goods;







var E_TYPE_ATTR = 1,    //加成属性
    E_TYPE_GUN = 2,     //枪属性
    E_TYPE_SKIN = 3,     //皮肤
    E_TYPE_GOODS = 4   //物品

var E_GUN_OBJ = 20;
var E_SKIN_OBJ = 40;


//效果对象
var EFFECT = {
    TYPE_ATTR: E_TYPE_ATTR,
    TYPE_GUN: E_TYPE_GUN,
    TYPE_SKIN: E_TYPE_SKIN,
    TYPE_GOODS: E_TYPE_GOODS,
    
    OBJ_GUN: E_GUN_OBJ,
    OBJ_SKIN:E_SKIN_OBJ,

    1: {
        type: E_TYPE_ATTR,
        name: "药水",
        attr: {
            h: 10,  //加10生命值
        },
        duration: 0,
    },
    2: {
        type: E_TYPE_ATTR,
        name: "加速",
        attr: {
            v: 2,  //加10生命值
        },
        duration: 100,
    },
    3: {
        type: E_TYPE_ATTR,
        name: "加经验",
        attr: {
            v: 2,  //加10生命值
        },
        duration: 100,
    },
    
    

    //枪
    10: {
        type: E_TYPE_GUN,
        name: "散弹枪",
        only: true,
        attr: {
            gun: 20 - 20,     //第20号枪
        },
        duration: Infinity,     //永久持续
    },
    11: {
        type: E_TYPE_GUN,
        name: "散弹枪",
        only:true,
        attr: {
            gun: 21 - 20,     //第21号枪
        },
        duration: Infinity,     //永久持续
    },
    12: {
        type: E_TYPE_GUN,
        name: "连发枪",
        only: true,     //效果唯一
        attr: {
            gun: 22 - 20,     //第22号枪
        },
        duration: Infinity,     //永久持续
    },
    
    //枪对象
    20: {   //默认枪

    },
    
    
    
    
    
    //皮肤
    30: {
        type: E_TYPE_SKIN,
        name: "默认皮肤",
        only: true,
        attr: {
            skin: 40 - 40,
        },
        duration: Infinity,     //永久持续
    },
    31: {
        type: E_TYPE_SKIN,
        name: "皮肤1",
        only: true,
        attr: {
            skin: 41 - 40,
        },
        duration: Infinity,     //永久持续
    },
    
    
    
    //皮肤对象
    40: {
        type: E_SKIN_OBJ,
        name: "默认皮肤",
        model: null,
    },
    41: {
        type: E_SKIN_OBJ,
        name: "皮肤1",
        model: null,
    },
    
    
    
    
    
    

    // 石头
    50: {
        type: E_TYPE_GOODS,
        name: "方块石头",
        max_h: 10,  //最大生命值
        effect: {
            exp: 10,  //加10经验值
        },
        model: null,
        radius: 4,
    },
    51: {
        type: E_TYPE_GOODS,
        name: "三角形石头",
        max_h: 10,  //最大生命值
        effect: {
            exp: 10,  //加10经验值
        },
        model: null,
        radius: 3,
    },
    52: {
        type: E_TYPE_GOODS,
        name: "加血",
        max_h: 0,
        effect: {
            effects: 1, //对应效果
        },
        model: null,
        radius:3,
    }
    
}


//物品对象
var GOODS_OBJ = {


}







Thing.BaseThing = BaseThing;
Thing.FeiJi = FeiJi;
Thing.Shell = Shell;
Thing.Goods = Goods;
Thing.EFFECT = EFFECT;

if (!this.window) {
    module.exports = Thing;
}







//set m(value) {
//    this.calcuLoc();
//    this._m = value;
//    this._m_vector = tools.deg2vector(this._m);
//},
//get m() { 
//return this._m;
//},