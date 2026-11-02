var express = require('express');
var router = express.Router();
var pagoMesCanceladoController = require('../src/controller/pagoMesCanceladoController');

/**
 * ============================================================================
 * RUTAS DE HISTORIAL DE MENSUALIDADES CANCELADAS (/api/pagoMesCancelado)
 * ============================================================================
 * Endpoints para consultar y registrar la bitácora de auditoría cuando se da
 * de baja o cancela una mensualidad pagada.
 */
router.get('/',pagoMesCanceladoController.getAll);
router.get('/:id',pagoMesCanceladoController.getById);
router.post('/',pagoMesCanceladoController.create);
router.put('/:id',pagoMesCanceladoController.update);

module.exports = router;