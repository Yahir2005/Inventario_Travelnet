var express = require('express');
var router = express.Router();
var instalacionController = require('../src/controller/instalacionController');

router.get('/',instalacionController.getAll);
router.get('/:id',instalacionController.getById);
router.post('/',instalacionController.create);
router.put('/:id',instalacionController.update);
router.delete('/:id',instalacionController.remove);

module.exports = router;

