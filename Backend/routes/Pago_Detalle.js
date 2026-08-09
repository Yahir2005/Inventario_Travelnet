var express = require('express');
var router = express.Router();
var pagoDetalleController = require('../src/controller/pagoDetalleController');

router.get('/', pagoDetalleController.getAll);
router.get('/:id', pagoDetalleController.getById);
router.post('/', pagoDetalleController.create);
router.put('/:id', pagoDetalleController.update);
router.delete('/:id', pagoDetalleController.remove);

module.exports = router;