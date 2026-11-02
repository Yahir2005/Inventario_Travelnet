var express = require('express');
var router = express.Router();
var torreController = require('../src/controller/torreController');

/**
 * ============================================================================
 * RUTAS DE TORRES DE TELECOMUNICACIONES (/api/torre y /api/Torre)
 * ============================================================================
 * Endpoints para listar, consultar por ID, registrar y actualizar las torres
 * utilizadas para enlaces inalámbricos por antena.
 */
router.get('/',torreController.getAll);
router.get('/:id',torreController.getById);
router.post('/',torreController.create)
router.put('/:id',torreController.update);

module.exports = router;