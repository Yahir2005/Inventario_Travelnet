var express = require('express');
var router = express.Router();
var UsuarioController = require('../src/controller/usuarioController');
const { route } = require('./users');

router.post('/login',UsuarioController.login);
router.get('/activos',UsuarioController.getByActive);

router.get('/',UsuarioController.getAll);
router.get('/',UsuarioController.create);

router.get('/:id',UsuarioController.getById);
router.put('/:id',UsuarioController.update);
router.delete('/:id',UsuarioController.remove);

module.exports = router;