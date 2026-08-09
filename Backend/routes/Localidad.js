var express = require('express');
var router = express.Router();
var localidadController = require('../src/controller/localidadController');

router.get('/', localidadController.getAll);
router.get('/:id', localidadController.getById);
router.post('/', localidadController.create);
router.put('/:id', localidadController.update);

module.exports = router;