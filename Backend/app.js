/**
 * ============================================================================
 * ARCHIVO PRINCIPAL DEL SERVIDOR EXPRESS (app.js)
 * ============================================================================
 * Este archivo es el corazón del Backend. Aquí se configura:
 * 1. La lectura de variables de entorno (`.env`).
 * 2. Los permisos de conexión desde Angular (`cors`) y el tamaño máximo de fotos (`50mb`).
 * 3. El guardia de seguridad global (Middleware JWT) que revisa el token de cada petición
 *    y asigna la conexión de base de datos (`req.db`) según el rol del usuario.
 * 4. El registro de todas las rutas de la API (`/api/cliente`, `/api/pago`, etc.).
 * 5. El manejo centralizado de errores en formato JSON.
 */
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
var planRouter = require('./routes/Plan');
var infraestructuraRouter = require('./routes/Infraestructura');
var app = express();

// Convierte automáticamente los números enteros gigantes (BigInt) de MariaDB a texto al enviarlos por JSON
BigInt.prototype.toJSON = function() { return this.toString(); };

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middlewares globales: registro de peticiones en consola, CORS para Angular y límite de 50MB para imágenes Base64
app.use(logger('dev'));
app.use(cors({ origin:['http://localhost:4200', 'http://localhost:8080', 'http://127.0.0.1:8080']}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { index: false, dotfiles: 'deny' }));

/**
 * MIDDLEWARE DE AUTENTICACIÓN Y SELECCIÓN DE POOL DE BASE DE DATOS:
 * - Si la petición va a `/api/usuarios/login`, le asigna el pool básico de login y la deja pasar.
 * - Para cualquier otra ruta, exige el encabezado `Authorization: Bearer <token>`,
 *   verifica la firma del JWT y asigna el pool de MariaDB correspondiente al rol del empleado.
 */
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
      req.user = decoded;
      req.db = getDbPool(decoded.rol); 
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  }

  return res.status(401).json({ error: 'No autorizado. Falta el token de acceso.' });
});

// Registro de los módulos de rutas de la API REST
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/usuarios',usuarioRouter);
app.use('/api/cliente',clienteRouter);
app.use('/api/instalacion',instalacionRouter);
app.use('/api/imagenInstalacion',imagenInstalacionRouter);
app.use('/api/pago',pagoRouter);
app.use('/api/OLT',oltRouter);
app.use('/api/olt',oltRouter);
app.use('/api/torre',torreRouter);
app.use('/api/Torre',torreRouter);
app.use('/api/localidad',localidadRouter);
app.use('/api/mensualidad',mensualidadRouter);
app.use('/api/pagoDetalle',pagoDetalleRouter);
app.use('/api/pagoMesCancelado',PagoMesCanceladoRouter);
app.use('/api/corteCaja',corteCajaRouter);
app.use('/api/CorteCaja',corteCajaRouter);
app.use('/api/plan',planRouter);
app.use('/api/infraestructura',infraestructuraRouter);

// 404 handler para rutas no encontradas
app.use(function(req, res, next) {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// error handler en JSON
app.use(function(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const isDev = req.app.get('env') === 'development';
  res.status(status).json({
    error: status >= 500 && !isDev
      ? 'Error interno del servidor'
      : (err.message || 'Error interno del servidor')
  });
});

// Prueba inicial de conexión a MariaDB al arrancar el servidor
const pool = getDbPool();
pool.getConnection().then(connection => {
  console.log('✅ Conectado a MariaDB correctamente.');
  connection.release();
}).catch(err => {
  console.error('❌ Error al conectar con MariaDB:', err.message);
});

module.exports = app;
