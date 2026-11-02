var express = require('express');
var router = express.Router();
var corteCajaController = require('../src/controller/corteCajaController');

/**
 * ============================================================================
 * RUTAS DE CORTE DE CAJA (/api/corteCaja)
 * ============================================================================
 * Endpoints para listar, consultar por ID, registrar, actualizar y eliminar
 * los cortes de caja de los turnos de cobranza.
 */
router.get('/',corteCajaController.getAll);
router.get('/:id',corteCajaController.getById);
router.post('/',corteCajaController.create);
router.put('/:id',corteCajaController.update);
router.delete('/:id',corteCajaController.remove);

module.exports = router;