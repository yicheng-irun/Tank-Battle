var cleancss = require('clean-css');
var fs = require('fs');
var path = require('path')

//cleancss.process(source)
var ccss = new cleancss();

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


/**
 * 
 * @example
 * // 在模板文件中  
 * 
{% cssmin %}
    <style>
        .div-404 {
            text-align: center;
            padding-top: 200px;
        }
        .div-404>h1{
            font-size: 50px;
        }
        .div-404>h2{
        }
        .div-404>p{
        }
    </style>
{% endcssmin %}

 * @可以设置参数 [-o 路径] [-u]
 * @ {% cssmin "-o yourapp/demo.css" %} -o 后面加路径 表示导出到一个css文件中
 * @ {% cssmin "-u" %} -u 表示内容不压缩，不加情况下默认是压缩的
 */
var compile = function (compiler, args, content, parents, options, blockName) {
    //console.log(arguments);
    //return '_output += \'' + "afsfs" + '\';'
    //console.log(args);
    var zip = true,
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
            if (code == "u") {
                zip = false;
            } else if (code == "o") {
                daochu = aglist[++i];
            }
        }
    }
    
    var resultcode = "";
    
    var result = "";
    try {
        for (var i in content) {
            var has = 0;
            var s = content[i].replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, function (a, b, c, d, e) {
                has++;
                if (zip) {
                    var mcss = ccss.minify(c)
                    resultcode = mcss.styles;
                } else {
                    resultcode = c;
                }
                if (daochu) {
                    result += resultcode;
                } else {
                    result += b + resultcode + d;
                }
                return "";
            });

            if (daochu) {
                var filedir = path.join("public", daochu);
                fs.writeFileSync(filedir, result);

                result = "<link rel='stylesheet' href='" + daochu + "' />";
            }



        }
    } catch (e) {
        var estr = e + "";
        result = "<style>/* A error was happend on css min process */</style>";
    }
    //console.log(result)
    //真烦，这里调了好久，最后在swig的源码中找了replace解决了
    //return '_output += \'' + result + '\';'
    return '_output += "' + result.replace(/\\/g, '\\\\').replace(/\n|\r/g, '\\n').replace(/"/g, '\\"') + '";\n';
};

exports.attach = function (swig) {
    swig.setTag('cssmin', parse, compile, true, true);
}