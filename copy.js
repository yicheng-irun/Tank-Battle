var fs = require('fs');

var indexhtml = "";
indexhtml = fs.readFileSync("views/index.html").toString();

indexhtml.replace(/\/\/copycode\(([^\(\)]+)\)([\s\S]+?)\/\/endcopycode/g, function (a, b, c, d) {
    var code = c.replace(/\/\*copycode([\s\S]+?)\*\//g, function (a1, b1, c1, d1) {
        return b1;
    });
    fs.writeFileSync(b, code);
    console.log("copy-> " ,b)
});

console.log("copy end ... ")





