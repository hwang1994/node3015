var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require("./config/passport");

var db = require("./models");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var cors = require('cors');
var csrf = require('csurf');

var app = express();

const corsConfig = {
  credentials: true,
  origin: ['http://localhost:3000']
};

app.use(cors(corsConfig));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(csrf({ cookie: true }))

app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/csrf', function (req, res) {
  res.json(req.csrfToken());
})
require('./associations.js')(app);
require("./routes/loginRoute.js")(app);
require("./routes/itemRoute.js")(app);
require("./routes/productRoute.js")(app);
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

db.sequelize.sync().then(function() {
  app.listen(function() {
    console.log('Connected to db');
  });
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
