var express = require('express');
var router = express.Router();
var corteCajaController = require('../src/controller/corteCajaController');

router.get('/',corteCajaController.getAll);
router.get('/:id',corteCajaController.getById);
router.post('/',corteCajaController.create);
router.put('/:id',corteCajaController.update);
router.delete('/:id',corteCajaController.remove);

module.exports = router;