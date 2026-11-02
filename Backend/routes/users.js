var express = require('express');
var router = express.Router();

/**
 * ============================================================================
 * RUTA DE EJEMPLO DE EXPRESS (routes/users.js)
 * ============================================================================
 * Ruta plantilla generada por Express. Las rutas reales de usuarios del sistema
 * se encuentran en `routes/Usuario.js` bajo `/api/usuarios`.
 */
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
