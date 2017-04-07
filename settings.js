


var settings = {}

settings.isonline = false;
if (process.cwd().indexOf("bae") != -1) {
    settings.isonline = true;
}
//settings.isonline = true;




module.exports = settings;