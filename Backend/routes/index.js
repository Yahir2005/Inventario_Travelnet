var express = require('express');
var router = express.Router();

/**
 * ============================================================================
 * RUTA RAÍZ DE PRUEBA (routes/index.js)
 * ============================================================================
 * Ruta por defecto generada por Express para comprobar que el servidor responde.
 */
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
