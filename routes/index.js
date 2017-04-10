var express = require('express');
var router = express.Router();
var settings = require('../settings');
var fs = require('fs');
var chat = require('./chat.js');

var count = 0;

/* GET home page. */
router.get('/', function (req, res) {
    var title = "坦克大作战", bgtitle = "坦克大作战";
    if (!settings.isonline) {
        title = "";
        bgtitle = ""
    }
    res.render('index', {
        title: title,
        bgtitle: bgtitle,
        count: count++
    });
});



router.get("/chatdata", function (req, res) {

    res.send(chat.messages);
});

router.get("/chatmanage", function (req, res) {
    
    res.render("chat_manage", {});
});
router.post("/chatmanage", function (req, res ,next) {
    if (req.body.p == "yicheng") {
        if (req.body.v) {
            chat.noticeWord(req.body);
        }
        res.send({
            c: chat.getClientsCount()
        })
    } else {
        next();
    }
});

router.get('/bguse', function (req, res) {
    res.render('bguse', { title: '随机背景生成器' });
});
router.get('/sheshe', function (req, res) {
    res.render('sheshe2', { title: 'sheshe' });
});

router.get('/restart', function (req, res ,next) {
    //res.send('ok<br>' + new Date().toLocaleString());
    next();
    setTimeout(function () {
        process.send("restart");
    }, 10);
});

router.get('/svnupdate', function (req, res, next) {
    //res.send('ok<br>' + new Date().toLocaleString());
    next();
    process.send("svnupdate");
});

module.exports = router;