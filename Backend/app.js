require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var jwt = require('jsonwebtoken');
var jwtConfig = require('./src/config/jwt');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var getDbPool = require('./src/config/database');
var usuarioRouter = require('./routes/Usuario');
var clienteRouter = require('./routes/Cliente');
var instalacionRouter = require('./routes/Instalacion');
var imagenInstalacionRouter = require('./routes/Imagen_Instalacion');
var pagoRouter = require('./routes/Pago');
var oltRouter = require('./routes/OLT');
var torreRouter = require('./routes/Torre');
var localidadRouter = require('./routes/Localidad');
var mensualidadRouter = require('./routes/Mensualidad');
var pagoDetalleRouter = require('./routes/Pago_Detalle');
var PagoMesCanceladoRouter = require('./routes/PagoMesCancelado');
var corteCajaRouter = require('./routes/CorteCaja');
var app = express();

BigInt.prototype.toJSON = function() { return this.toString(); };

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(cors({ origin:['http://localhost:4200', 'http://localhost:8080', 'http://127.0.0.1:8080']}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  if (req.path === '/api/usuarios/login') {
    req.db = getDbPool(); 
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1]; 
    try {
      const decoded = jwt.verify(token, jwtConfig.getSecret()); 
      req.db = getDbPool(decoded.rol); 
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  }

  return res.status(401).json({ error: 'No autorizado. Falta el token de acceso.' });
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/usuarios',usuarioRouter);
app.use('/api/cliente',clienteRouter);
app.use('/api/instalacion',instalacionRouter);
app.use('/api/imagenInstalacion',imagenInstalacionRouter);
app.use('/api/pago',pagoRouter);
app.use('/api/OLT',oltRouter);
app.use('/api/torre',torreRouter);
app.use('/api/localidad',localidadRouter);
app.use('/api/mensualidad',mensualidadRouter);
app.use('/api/pagoDetalle',pagoDetalleRouter);
app.use('/api/pagoMesCancelado',PagoMesCanceladoRouter);
app.use('/api/corteCaja',corteCajaRouter);

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
