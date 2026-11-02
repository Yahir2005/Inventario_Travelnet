var express = require('express');
var router = express.Router();
var localidadController = require('../src/controller/localidadController');

/**
 * ============================================================================
 * RUTAS DE LOCALIDADES (/api/localidad)
 * ============================================================================
 * Endpoints para listar, consultar, crear y editar el catálogo de localidades
 * o comunidades donde TravelNet brinda cobertura.
 */
router.get('/', localidadController.getAll);
router.get('/:id', localidadController.getById);
router.post('/', localidadController.create);
router.put('/:id', localidadController.update);

module.exports = router;