var express = require('express');
var router = express.Router();
var planController = require('../src/controller/planController');

/**
 * ============================================================================
 * RUTAS DE PLANES Y TARIFAS (/api/plan)
 * ============================================================================
 * Endpoints para administrar tanto el catálogo de tarifas por modalidad
 * (`/api/plan/tarifas`) como los paquetes de velocidad (`/api/plan`).
 */
router.get('/tarifas', planController.getAllTarifas);
router.get('/tarifas/:id', planController.getTarifaById);
router.post('/tarifas', planController.createTarifa);
router.put('/tarifas/:id', planController.updateTarifa);
router.delete('/tarifas/:id', planController.removeTarifa);

router.get('/', planController.getAll);
router.get('/:id', planController.getById);
router.post('/', planController.create);
router.put('/:id', planController.update);
router.delete('/:id', planController.remove);

module.exports = router;
