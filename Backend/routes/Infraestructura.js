var express = require('express');
var router = express.Router();
var infraestructuraController = require('../src/controller/infraestructuraController');

/**
 * ============================================================================
 * RUTAS DE INFRAESTRUCTURA (/api/infraestructura)
 * ============================================================================
 * Endpoints CRUD para la tabla `Infraestructura`, que vincula el tipo de enlace
 * (`Fibra` o `Antena`) con la OLT o la Torre correspondiente.
 */
router.get('/', infraestructuraController.getAll);
router.get('/:id', infraestructuraController.getById);
router.post('/', infraestructuraController.create);
router.put('/:id', infraestructuraController.update);
router.delete('/:id', infraestructuraController.remove);

module.exports = router;
