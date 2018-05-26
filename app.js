var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var leaderRouter = require('./routes/leaderRouter');
var promoRouter = require('./routes/promoRouter');
var uploadRouter = require('./routes/uploadRouter');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const Dishes = require('./models/dishes');

const url = config.mongoUrl;
const connect = mongoose.connect(url, {
	//useMongoClient: true  //Not required in the new version
});

connect.then((db) => {

	var db = mongoose.connection;

	console.log('Connected correctly to server');

}, (err) => {
	console.log(err);
});

var app = express();

// For every request
app.all('*', (req, res, next) => {
	// If the incoming request is already coming through the secure port
	if(req.secure) {
		return next();
	}
	// If the incoming request is not coming through the secure port
	// Redirect it to the secure port
	else {
		res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
	}
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321'));

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
