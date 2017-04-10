var express = require('express');
var router = express.Router();
var settings = require('../settings');
var fs = require('fs');
var Buffer = require('buffer').Buffer;

router.get('/guns', function (req, res) {
    res.render('admin/guns.html', {
    });
});

router.get('/guns.js', function (req, res) {
    var gjs = fs.readFileSync("wsserver/guns.js");
    res.set("Content-Type", "application/javascript");
    res.send(gjs);
});

router.get('/guns.json', function (req, res) {
    var gjs = fs.readFileSync("routes/guns/gunbase.json");
    res.set("Content-Type", "application/javascript");
    res.send(gjs);
});

router.post('/guns.json', function (req, res) {
    var gjson = req.body.str;
    if (gjson) {
        fs.writeFileSync("routes/guns/gunbase.json",gjson, { encoding: 'utf-8'});
        res.json({ success: true });
    } else { 
        res.json({ success: false });
    }
});

router.get('/drow', function (req, res) {
    res.render('admin/drow.html', {
    });
})




router.post('/gunspic', function (req, res) {
    var b64code = req.body.str;
    var tpid = req.body.pid;
    var type = req.body.type;
    if (tpid == null) { 
        tpid = -1;
    }
    if (b64code) {
        b64code = b64code.replace("data:image/png;base64,", "");
        var savedata = new Buffer(b64code, "base64");
        
        if(type == "pao")
            fs.writeFileSync("public/p/p" + tpid + ".png", savedata);
        else if(type == "bgline")
            fs.writeFileSync("public/p/bgl.png", savedata);
        else if(type == "bgimg")
            fs.writeFileSync("public/p/bg2.png", savedata);
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

router.get('/guncodecopy', function (req, res) {
    var gjs = fs.readFileSync("routes/guns/gun_codecopy.txt");
    res.set("Content-Type", "application/text");
    res.send(gjs);
});

router.post('/guncodecopy', function (req, res) {
    var gjson = req.body.str;
    if (gjson) {
        fs.writeFileSync("routes/guns/gun_codecopy.txt", gjson, { encoding: 'utf-8' });
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});



module.exports = router;