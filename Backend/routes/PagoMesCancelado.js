var express = require('express');
var router = express.Router();
var pagoMesCanceladoController = require('../src/controller/pagoMesCanceladoController');

router.get('/',pagoMesCanceladoController.getAll);
router.get('/:id',pagoMesCanceladoController.getById);
router.post('/',pagoMesCanceladoController.create);
router.put('/:id',pagoMesCanceladoController.update);

module.exports = router;