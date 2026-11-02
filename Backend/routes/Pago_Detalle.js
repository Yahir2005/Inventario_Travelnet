var express = require('express');
var router = express.Router();
var pagoDetalleController = require('../src/controller/pagoDetalleController');

/**
 * ============================================================================
 * RUTAS DE DETALLE DE PAGOS (/api/pagoDetalle)
 * ============================================================================
 * Endpoints CRUD para la tabla puente `Pago_Detalle`, que relaciona un `Pago`
 * con una o varias `Mensualidades` cubiertas por ese cobro.
 */
router.get('/', pagoDetalleController.getAll);
router.get('/:id', pagoDetalleController.getById);
router.post('/', pagoDetalleController.create);
router.put('/:id', pagoDetalleController.update);
router.delete('/:id', pagoDetalleController.remove);

module.exports = router;