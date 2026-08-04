var express = require('express');
var router = express.Router();
var oltController = require('../src/controller/oltController');

router.get('/',oltController.getAll);
router.get('/:id',oltController.getById);
router.post('/',oltController.create);
router.put('/:id',oltController.update);

module.exports = router;