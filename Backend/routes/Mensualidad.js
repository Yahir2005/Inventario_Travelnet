var express = require('express');
var router = express.Router();
var mensualidadController = require('../src/controller/mensualidadController');

router.get('/', mensualidadController.getAll);
router.get('/instalacion/:instalacionId', mensualidadController.getByInstalacion);
router.get('/:id', mensualidadController.getById);
router.post('/cancelar', mensualidadController.cancelar);
router.post('/', mensualidadController.create);
router.put('/:id', mensualidadController.update);
router.delete('/:id', mensualidadController.remove);

module.exports = router;