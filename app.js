var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swig = require('swig');

var settings = require('./settings');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.engine("html", swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.set('view engine', 'html');
app.set('view cache', false);

if (settings.isonline) {
    app.set("isonline", true);
    app.set("env", "production");
    app.set("x-powered-by", false);
} else {
    app.set("isonline", false);
    //swig.setDefaults({ cache: false });
}
require('./util/cssmin.js').attach(swig);
require('./util/jsmin.js').attach(swig);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);
app.use('/admin', require('./routes/admin.js'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    //var err = new Error('Not Found');
    //err.status = 404;
    //next(err);
    res.status('404');
    res.render('404', {
        title: "404 not found",
        url: req.url,
    });
});


// error handlers

// development error handler
// will print stacktrace
//if (app.get('env') === 'development') {
if(!settings.isonline){
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('500', {
            title: 'server error 500',
            details: err.message,
            error: err
        });
    });
} else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('500', {
            title:'server error 500',
            error: {}
        });
    });
}




module.exports = app;
