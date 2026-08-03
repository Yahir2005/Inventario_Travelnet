var express = require('express');
var router = express.Router();
var imagen_InstalacionController = require('../src/controller/imagen_InstalacionController');

router.get('/',imagen_InstalacionController.getAll);
router.get('/:id',imagen_InstalacionController.getById);
router.post('/',imagen_InstalacionController.create);
router.put('/:id',imagen_InstalacionController.update);

module.exports = router;