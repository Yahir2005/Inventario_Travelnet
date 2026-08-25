var express = require('express');
var router = express.Router();
var pagoController = require('../src/controller/pagoController');

router.get('/',pagoController.getAll);
router.post('/desglose', pagoController.getDesglose);
router.get('/:id',pagoController.getById);
router.post('/',pagoController.create);
router.put('/:id',pagoController.update);

module.exports = router;