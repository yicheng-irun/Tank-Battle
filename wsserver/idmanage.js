

function get1bit(max_length) {
    var strlist = new Array(max_length);
    for (var i = 0; i < max_length; i++) {
        strlist[i] = String.fromCharCode(i);
    }
    return strlist;
}


/*
 * max_length 表示最大数量
 */
var idm_count = 0;
function IdManage(max_length,idm_name){
    max_length > 65535?max_length = 65535:0;
    max_length < 0?max_length = 0:0;
    
    idm_count++;

    this.idlist = null;
    this.idlist = get1bit(max_length);
    this.used = 0;
    this.name = idm_name || "idm_"+ idm_count;
    this.max_length = max_length;
}
IdManage.prototype.getOne = function () { 
    this.used++;
    return this.idlist.shift()
}
IdManage.prototype.isEmpty = function (){
    return this.idlist.length <= 0
}
IdManage.prototype.free = function (id){
    this.used--;
    this.idlist.push(id)
    //if (this.name == "wt")
    //    console.log(this.used,this.idlist.length, id.charCodeAt(0));
    //console.log(this.name + " free ", id.charCodeAt(0));
}

module.exports = IdManage;