var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var getDbPool = require('./src/config/database');
var usuarioRouter = require('./routes/Usuario');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(cors({ origin: 'http://localhost:4200'}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req,res,next){
  req.db = getDbPool();
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/usuarios',usuarioRouter);

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

const pool = getDbPool();
pool.getConnection().then(connection => {
  console.log('✅ Conectado a MariaDB correctamente.');
  connection.release();
}).catch(err => {
  console.error('❌ Error al conectar con MariaDB:', err.message);
});

module.exports = app;
