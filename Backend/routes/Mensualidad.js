var express = require('express');
var router = express.Router();
var mensualidadController = require('../src/controller/mensualidadController');

/**
 * ============================================================================
 * RUTAS DE MENSUALIDADES (/api/mensualidad)
 * ============================================================================
 * Endpoints para consultar todas las mensualidades, filtrar por `instalacionId`,
 * cancelar un mes pagado guardando el motivo en bitácora, o editarlo.
 */
router.get('/', mensualidadController.getAll);
router.get('/instalacion/:instalacionId', mensualidadController.getByInstalacion);
router.get('/:id', mensualidadController.getById);
router.post('/cancelar', mensualidadController.cancelar);
router.post('/', mensualidadController.create);
router.put('/:id', mensualidadController.update);
router.delete('/:id', mensualidadController.remove);

module.exports = router;