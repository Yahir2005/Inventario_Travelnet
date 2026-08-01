var express = require('express');
var router = express.Router();
var clienteController = require('../src/controller/clienteController');

router.get('/lista-detallada',clienteController.getClienteInstallationsList);

router.get('/',clienteController.getAll);
router.get('/:id',clienteController.getById);
router.post('/',clienteController.create);
router.put('/:id',clienteController.update);
router.delete('/:id',clienteController.remove);

module.exports = router;
