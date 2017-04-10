var sktio = require('socket.io');


var io;

function init(app){
    if (!io) {
        io = sktio(app);
        event();
    }
}

function getTime(){
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    h < 10?h = "0" + h:0;
    m < 10?m = "0" + m:0;
    s < 10?s = "0" + s:0;
    return h + ":" + m + ":" + s;
}

var messages = [];

function saveData(data){
    messages.push(data);
    if (messages.length > 50) {
        messages.splice(2);
    }
}

function event() {
    
    io.on('connection', function (socket) {
        var myid = socket.id.substr(16)

        socket.emit('y', { id: myid });
        socket.on('s', function (data) {
            if (typeof data.v == "string") {
                data.v = data.v.substring(0, 100);
            } else {
                return;
            }
            send({
                u: 0,
                i: myid,
                t: getTime(),
                n: data.n || "匿名",
                v: data.v || "say hello! ",
            });
        });
    });
    
    function syssend(data){
        io.emit("m", data);
    }

    function send(data){
        try {
            io.emit("m", data);
            saveData(data);
        } catch (e) {
            console.log(e);
        }
    }

}

function getClientsCount() {
    if (io) {
        return io.eio.clientsCount;
    } else {
        return 0;
    }
}

function noticeWord(data){
    if (io) {
        io.emit("m", {
            u: 1,
            i: "system",
            t: getTime(),
            n: data.n || "匿名",
            v: data.v || "say hello! ",
        });
    }
}




module.exports = {
    init: init,
    noticeWord: noticeWord,
    getClientsCount: getClientsCount,
    messages:messages
};