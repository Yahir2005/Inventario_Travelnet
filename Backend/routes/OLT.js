var express = require('express');
var router = express.Router();
var oltController = require('../src/controller/oltController');

/**
 * ============================================================================
 * RUTAS DE EQUIPOS OLT (/api/olt y /api/OLT)
 * ============================================================================
 * Endpoints para listar, consultar por ID, registrar y actualizar las terminales
 * de línea óptica (OLT) de la red de fibra.
 */
router.get('/',oltController.getAll);
router.get('/:id',oltController.getById);
router.post('/',oltController.create);
router.put('/:id',oltController.update);

module.exports = router;