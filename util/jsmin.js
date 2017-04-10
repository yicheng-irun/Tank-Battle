var uglifyjs = require('uglify-js');
var fs = require('fs');
var path = require('path')

var parse = function (str, line, parser, types, options) {
    //console.log(arguments);
    
    var matched = false;
    parser.on('*', function (token) {
        if (matched) {
            throw new Error('Unexpected token ' + token.match + '.');
        }
        matched = true;
        return true;
    });
    
    return true;
};


var compile = function (compiler, args, content, parents, options, blockName) {
    //console.log(args);
    var zip = true,
        bibao = false,
        daochu = false;
    var aglist = [];
    if (args.length > 0) {
        var arg = args[0].replace(/(^['"])|(['"]$)/g, "")
        var aglist = arg.split(" ");
        for (var i = 0; i < aglist.length; i++) {
            var isparam = false;
            var code = aglist[i].replace(/^[-]/g, function () {
                isparam = true;
                return "";
            });
            if (!isparam) {
                continue;
            }
            if (code == "b") {
                bibao = true;
            } else if (code == "u") {
                zip = false;
            } else if (code == "o") {
                daochu = aglist[++i];
            }
        }
    }
    
    var resultcode = "";
    
    var result = "";    //function(){
    try {
        if (bibao) {
            jscode = "(function(){";
            for (var i in content) {
                var has = 0;
                var s = content[i].replace(/<script[^>]*>([\s\S]*?)<\/script>/g, function (a, b, c) {
                    has++;
                    jscode += ";" + b;
                    return "";
                });
            }
            jscode += "})();";
            if (zip) {
                var mjs = uglifyjs.minify(jscode, {
                    fromString: true , compress: {
                        dead_code: true, 
                        hoist_funs: true, 
                        hoist_vars: true,
                    }
                });
                resultcode += mjs.code;
            } else {
                resultcode += jscode;
            }
            
        } else {
            for (var i in content) {
                var has = 0;
                var s = content[i].replace(/<script[^>]*>([\s\S]*?)<\/script>/g, function (a, b, c) {
                    has++;
                    if (zip) {
                        var mjs = uglifyjs.minify(b, { fromString: true });
                        resultcode += mjs.code;
                    } else {
                        resultcode += ";" + b;
                    }
                    return "";
                });
            }
        }
        
        if (daochu) {
            var filedir = path.join("public", daochu);
            fs.writeFileSync(filedir, resultcode);
            result = "<script src=\"" + daochu + "\"></script>"
        } else {
            result = "<script>" + resultcode + "</script>";
        }
    } catch (e) {
        //result = "<pre>" + e.message + " in line:" + e.line + " col:" + e.col + " pos:" + e.pos + "</pre>";
        var estr = e + "";
        result = "<script>console.error(\"" + "A error was happend on js zip process" + "\")</script>";
    }
    
    //return '_output += \'' + result + '\';'
    return '_output += "' + result.replace(/\\/g, '\\\\').replace(/\n|\r/g, '\\n').replace(/"/g, '\\"') + '";\n';
};


exports.attach = function (swig){
    swig.setTag('jsmin', parse, compile, true, true);
}