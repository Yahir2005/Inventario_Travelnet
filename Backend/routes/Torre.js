var express = require('express');
var router = express.Router();
var torreController = require('../src/controller/torreController');

router.get('/',torreController.getAll);
router.get('/:id',torreController.getById);
router.post('/',torreController.create)
router.put('/:id',torreController.update);

module.exports = router;