var express = require('express');
var router = express.Router();
var instalacionController = require('../src/controller/instalacionController');

/**
 * ============================================================================
 * RUTAS DE INSTALACIONES (/api/instalacion)
 * ============================================================================
 * Endpoints para consultar instalaciones (con versión detallada que une cliente,
 * plan, localidad, OLT/Torre y fotos), crear, actualizar y dar de baja.
 */
router.get('/lista-detallada',instalacionController.getAllDetallado);
router.get('/',instalacionController.getAll);
router.get('/:id',instalacionController.getById);
router.post('/',instalacionController.create);
router.put('/:id',instalacionController.update);
router.delete('/:id',instalacionController.remove);

module.exports = router;

